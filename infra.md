# Infrastruktur & Konfigurasi Lingkungan

## DNS & Deployment Targets
- **Web (Next.js)**: `classroom.example.com` → Vercel project `classroom-web`
- **API (NestJS)**: `api.classroom.example.com` → Fly.io app `classroom-api`
- **Worker (BullMQ)**: `worker.classroom.example.com` → Fly.io app `classroom-worker`
- **Static CDN**: `cdn.classroom.example.com` → Cloudflare R2 public bucket

## Secret Management
- Gunakan GitHub Actions secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_WEB_PROJECT_ID`, `FLY_API_TOKEN`, `FLY_WORKER_TOKEN`.
- Simpan kredensial database Neon dan Redis Upstash di Vercel (web) serta Fly.io (api/worker) secrets.
- Sentry DSN dan OTEL endpoint disimpan sebagai `SENTRY_DSN`, `OTEL_EXPORTER_OTLP_ENDPOINT` di seluruh environment.

## Database (Neon PostgreSQL)
- Endpoint contoh: `postgresql://classroom_owner:password@ep-silent-12345.ap-southeast-1.aws.neon.tech/classroom`
- Aktifkan connection pooling (pgBouncer) untuk API & worker.
- Role:
  - `classroom_owner`: migrasi & admin.
  - `classroom_app`: akses read/write aplikasi.

## Redis (Upstash)
- URL contoh: `rediss://default:token@apn1-distinct-redis.upstash.io`
- Atur rate limit 200 req/menit (API) menggunakan Upstash REST.

## Cloudflare R2
- Bucket: `classroom-assets`
- Binding production:
  - `STORAGE_R2_ACCOUNT_ID`
  - `STORAGE_R2_ACCESS_KEY_ID`
  - `STORAGE_R2_SECRET_ACCESS_KEY`
  - `STORAGE_R2_PUBLIC_URL`

## Fly.io Configuration
- `apps/api/fly.toml` dan `apps/worker/fly.toml` memuat port 8080.
- Tambahkan secrets: `DATABASE_URL`, `REDIS_URL`, `INTERNAL_API_KEY`, `SENTRY_DSN`, `STORAGE_*`.

## Vercel Configuration
- `apps/web` memerlukan env: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SENTRY_DSN`, `INTERNAL_API_KEY`, `AUTH_COOKIE_NAME`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- Aktifkan Edge Config untuk rate limiting jika diperlukan.

## Monitoring & Observability
- Sentry projects: `classroom-web`, `classroom-api`, `classroom-worker`.
- OpenTelemetry collector: `https://otel.example.com/v1/traces` disimpan pada `OTEL_EXPORTER_OTLP_ENDPOINT`.
- Jadwalkan review log harian via Fly.io log shipper.

## Backup & DR
- Neon PITR aktif, snapshot harian ke Cloudflare R2.
- Redis Upstash backup mingguan (export JSON).
- R2 versi objek diaktifkan untuk mencegah kehilangan file.
