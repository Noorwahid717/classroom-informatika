import Link from "next/link";

const actions = [
  {
    title: "Masuk sebagai pengajar",
    description: "Kelola kelas, materi, tugas, dan nilai siswa dalam satu tempat.",
    href: "/admin/dashboard",
    cta: "Buka dashboard pengajar"
  },
  {
    title: "Masuk sebagai siswa",
    description: "Lihat materi kelas, unggah tugas, dan ikuti pengumuman terbaru.",
    href: "/admin/dashboard",
    cta: "Buka ruang kelas"
  }
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-background px-6 py-16">
      <section className="max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Classroom Informatika</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Portal pembelajaran internal untuk kelas Informatika</h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Sistem ini berfokus pada manajemen kelas tertutup: materi, tugas, penilaian, presensi, dan pengumuman hanya dapat diakses oleh
          guru serta siswa yang terdaftar.
        </p>
      </section>
      <section className="grid w-full max-w-4xl gap-6 sm:grid-cols-2">
        {actions.map((action) => (
          <article key={action.title} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 text-left shadow-sm">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-card-foreground">{action.title}</h2>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
            <div className="mt-6">
              <Link
                href={action.href}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {action.cta}
              </Link>
            </div>
          </article>
        ))}
      </section>
      <p className="max-w-2xl text-center text-xs text-muted-foreground sm:text-sm">
        Hubungi admin teknis untuk mendapatkan akun pengajar atau undangan kelas. Semua aktivitas dicatat untuk kebutuhan audit internal.
      </p>
    </main>
  );
}
