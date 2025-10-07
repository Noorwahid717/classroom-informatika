# Classroom Informatika

Repositori ini sedang direstrukturisasi menjadi LMS ringan untuk kebutuhan kelas Informatika. Fokus pengembangan meliputi manajemen kelas tertutup, materi, tugas, penilaian, presensi, dan pengumuman internal.

## Dokumentasi

- [Gambaran umum](docs/CLASSROOM-README.md)
- [Panduan pengembangan](docs/DEVELOPMENT.md)
- [Catatan deployment](docs/CLASSROOM-DEPLOYMENT.md)

Dokumen operasional lama dipindahkan ke [`docs/archive`](docs/archive) untuk referensi historis.

## Pengembangan lokal

Gunakan `pnpm` sebagai package manager utama.

```bash
pnpm install
pnpm dev
```

Sebelum melakukan commit, jalankan pemeriksaan dasar:

```bash
pnpm lint
pnpm test
pnpm build
```

## Keamanan

Tidak ada registrasi publik maupun kredensial bawaan yang disertakan di dalam repositori. Hubungi admin teknis untuk provisioning akun saat environment otentikasi internal selesai dipindahkan ke NextAuth.
