# Rencana Migrasi Classroom Informatika

## 1. Inventaris Aset Stack Lama
| Kategori | Detail | Lokasi | Catatan |
| --- | --- | --- | --- |
| Landing page & hero statistik | Redirect otomatis berdasarkan role, fitur upload tugas & Monaco editor | `src/app/page.tsx` | Mengandalkan NextAuth session & fitur lint otomatis di FE 【F:src/app/page.tsx†L1-L88】 |
| Admin dashboard | Pengelolaan pendaftaran, pengumuman, galeri, kegiatan | `src/app/dashboard` | Role ADMIN/SUPER_ADMIN dari NextAuth 【F:README.md†L15-L24】 |
| Auth | NextAuth Credentials Provider, login modal | `src/components/LoginModal.tsx`, `src/pages/api/auth/[...nextauth].ts` | Password tersimpan di SQLite 【F:README.md†L34-L44】 |
| Database | Prisma schema dengan tabel users, classes, assignments, submissions, dll | `prisma/schema.prisma` | Saat ini menggunakan SQLite lokal |
| Deployment | Skrip Vercel dan shell helper | `VERCEL_DEPLOYMENT.md`, `setup-vercel-env.sh` | Fokus single repo Next.js |

## 2. Rencana Fase Migrasi
| Fase | Durasi | Lingkup | Risiko | Mitigasi | KPI |
| --- | --- | --- | --- | --- | --- |
| F1 - Persiapan Monorepo | 1 minggu | Setup Turborepo, pnpm, lint/test pipeline | Ketergantungan lint lintas paket | Jalankan CI matrix, gunakan shared config | Build & lint sukses untuk semua apps |
| F2 - Backend & Database | 2 minggu | Implement NestJS API, schema Postgres, migrasi data | Ketidaksesuaian skema lama-baru | ETL bertahap + verify checksum | 0 error migration, API test hijau |
| F3 - Frontend App Router | 2 minggu | Port landing, dashboard, konten, pendaftaran ke Next.js 14 | Perubahan UX | Desain review dengan stakeholder | Page Lighthouse >85, form submission sukses |
| F4 - Worker & Penilaian | 1 minggu | BullMQ worker lint + Playwright | Beban CPU tinggi | Scale Fly.io machines, sandbox `--no-sandbox` | SLA evaluasi <5 menit |
| F5 - Observability & Cutover | 1 minggu | Sentry, OTEL, GitHub Actions deploy, cutover | Data drift selama freeze | Delta sync script + verifikasi | Error rate <1%, traffic sukses >99% |

## 3. Diagram Arsitektur ASCII
```
                        +-----------------+
                        |  Vercel (Next)  |
                        |  apps/web       |
                        +--------+--------+
                                 |
                                 | HTTPS / Auth.js
                                 v
+---------+   WebSocket   +------+-------+     BullMQ       +----------------+
| Browser |<------------->|  Fly.io API  |<--------------->| Fly.io Worker  |
+---------+               |  apps/api    |                 |  apps/worker   |
     ^                    +------+-------+                 +--------+-------+
     |                           |                                   |
     |      S3 uploads / CDN     | REST gRPC                         |
     |                           v                                   |
     |                    +------+-------+                           |
     |                    | Cloudflare R2|<--------------------------+
     |                    +------+-------+
     |                           |
     |  TanStack Query            v
     |                    +------+-------+
     |                    |  Neon Postgres|
     |                    +------+-------+
     |                           |
     |                    +------+-------+
     |                    | Upstash Redis|
     |                    +------+-------+
     |                           |
     |                    +------+-------+
     |                    | Sentry & OTEL|
     |                    +--------------+
```

## 4. Pemetaan Fitur Lama → Baru
| Fitur Lama | Modul Baru | Rute/API Baru | Catatan |
| --- | --- | --- | --- |
| Hero statistik, daftar fitur | `apps/web/app/page.tsx` | GET `/stats` (Nest) | Server action `get-stats` konsumsi API dengan API key 【F:apps/web/app/page.tsx†L1-L37】【F:apps/web/server-actions/get-stats.ts†L1-L34】 |
| Dashboard admin | `apps/web/app/admin/dashboard/page.tsx` | GET `/admin/dashboard` (JWT) | Menggunakan TanStack Query + Widget UI 【F:apps/web/app/admin/dashboard/page.tsx†L1-L33】【F:apps/web/server-actions/get-dashboard-data.ts†L1-L38】 |
| Manajemen konten | `apps/web/components/content-manager.tsx` | REST `/content` (JWT/API key) | Editor Monaco, publish toggle 【F:apps/web/components/content-manager.tsx†L1-L92】 |
| Form pendaftaran | `apps/web/components/registration-form.tsx` | POST `/registrations` | Validasi Zod di server 【F:apps/web/components/registration-form.tsx†L1-L88】 |
| Penilaian otomatis | `apps/worker/src/processors/evaluation.processor.ts` | Queue `submission-evaluations` | HTMLHint, Stylelint, ESLint, Playwright 【F:apps/worker/src/processors/evaluation.processor.ts†L1-L25】 |
| Auth credentials | `apps/api/src/modules/auth` + Auth.js | POST `/auth/login`, `/auth/google`, GET `/auth/session` | Rehash on login bila flag `needsPasswordRehash` true 【F:apps/api/src/modules/auth/auth.service.ts†L1-L49】 |

## 5. Pemetaan Data & ETL
| Entitas SQLite | PostgreSQL | Transformasi |
| --- | --- | --- |
| `users` | `User` | Normalisasi role uppercase, field `needsPasswordRehash` true untuk record dengan password lama |
| `classes` | `Classroom`, `ClassMember` | Owner jadi `Classroom.ownerId`, peserta `ClassMember` |
| `assignments` | `Assignment`, `Rubric`, `RubricCriterion` | Rubrik lama ditransformasi JSON → tabel relasional |
| `submissions` | `Submission`, `Grade` | Status mapping: submitted→SUBMITTED, graded→GRADED |
| `announcements` | `Announcement` | Slug unik dipertahankan |
| `events` | `Event` | Field lokasi & waktu langsung copy |
| `registrations` | `Registration` | Status uppercase |

### Skrip Migrasi
1. `pnpm --filter @classroom/scripts exec tsx scripts/export_sqlite.ts`
2. `pnpm --filter @classroom/scripts exec tsx scripts/transform.ts`
3. `pnpm --filter @classroom/scripts exec tsx scripts/import_postgres.ts`
4. `pnpm --filter @classroom/scripts exec tsx scripts/verify_integrity.ts`
5. `pnpm --filter @classroom/scripts exec tsx scripts/migrate_files_to_r2.ts`

Semua skrip bersifat idempotent: export/transform menimpa file, import menggunakan `ON CONFLICT DO NOTHING`, upload R2 cek checksum sebelum tulis.

## 6. Auth & Keamanan
- Auth.js (NextAuth) di Next.js menggunakan Google OAuth, fallback Credentials via API `/auth/login`.
- JWT diset dalam cookie HTTPOnly `AUTH_COOKIE_NAME` dari API.
- Rehash-on-login: jika `needsPasswordRehash` true maka worker `auth.service` akan hashing ulang dengan bcrypt 12 dan reset flag.【F:apps/api/src/modules/auth/auth.service.ts†L17-L28】
- Password reset massal opsional via email broadcast.
- Fastify rate limit 200 req/menit, helmet aktif, CORS ketat domain Next.【F:apps/api/src/main.ts†L7-L27】
- Worker Playwright dijalankan dengan `--no-sandbox` dan tidak jalan sebagai root di Fly.io (processes config).
- Anti zip-slip: unggahan diperiksa di API (TODO implement detail saat endpoint file dibuat).

## 7. CI/CD & Observability
- GitHub Actions `ci.yml`, `deploy-web.yml`, `deploy-api.yml`, `deploy-worker.yml` menjalankan lint/build lalu deploy otomatis ke Vercel & Fly.【F:.github/workflows/ci.yml†L1-L24】【F:.github/workflows/deploy-api.yml†L1-L26】
- Sentry init di web layout dan API/worker modul observability.【F:apps/web/app/layout.tsx†L31-L47】【F:apps/api/src/observability.ts†L1-L25】
- OTEL NodeSDK opsional melalui env `OTEL_EXPORTER_OTLP_ENDPOINT`.

## 8. Strategi Cutover & Rollback
1. **Pre-cutover**: Freeze penulisan di SQLite, jalankan export→import, verifikasi `scripts/verify_integrity.ts` untuk count & checksum.
2. **Blue-Green**: Deploy API & worker ke Fly staging, jalankan smoke test `GET /health`, `GET /stats`, enqueue sample job.
3. **Canary Web**: Gunakan Vercel Preview, 10% traffic via Edge Config sebelum full cutover.
4. **Data Delta Sync**: Jalankan ulang `export_sqlite.ts` + `transform.ts` untuk data yang masuk saat freeze, gunakan UPSERT di Postgres.
5. **DNS switch**: Update CNAME ke Vercel & Fly once verified.
6. **Rollback**: Jika metrik error >1% atau latensi >1s selama 10 menit, rollback DNS ke lama, restore Postgres dari snapshot terakhir.

## 9. Checklist Verifikasi Pasca-Rilis
- [ ] Landing page menampilkan statistik akurat (`/stats`).
- [ ] Admin login Google berhasil & RBAC sesuai.
- [ ] CRUD konten melalui Content Manager tersimpan di Postgres.
- [ ] Submit tugas menghasilkan job BullMQ dan status `GRADED` dalam <5 menit.
- [ ] File upload tersedia di Cloudflare R2 & checksum cocok.
- [ ] Sentry menangkap error test & terlihat di dashboard.
- [ ] GitHub Actions deploy pipeline hijau.
- [ ] Backup Neon & Upstash tervalidasi.
