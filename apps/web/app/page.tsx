import Link from "next/link";
import { Button } from "@classroom/ui/button";
import { Spotlight } from "@classroom/ui/spotlight";
import { Suspense } from "react";
import { LiveStats } from "../components/live-stats";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-12 bg-gradient-to-b from-primary/10 via-background to-background px-6 py-24">
      <Spotlight />
      <section className="max-w-4xl text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Generasi Muda Informatika</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-6xl">Bangun kompetensi digital dengan kurikulum terkurasi</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          GEMA Classroom memadukan pembelajaran sinkron dan asinkron dengan sistem penilaian otomatis dan dashboard admin terpadu.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/register">Daftar Sekarang</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/admin/dashboard">Masuk Admin</Link>
          </Button>
        </div>
      </section>
      <Suspense fallback={<div className="text-muted-foreground">Memuat statistik...</div>}>
        <LiveStats />
      </Suspense>
      <section className="grid max-w-5xl gap-6 sm:grid-cols-3">
        {["Workshop mingguan", "Review mentor", "Portfolio digital"].map((feature) => (
          <div key={feature} className="rounded-xl border border-border bg-card p-6 text-left shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground">{feature}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Terintegrasi langsung dengan modul kelas, tugas, dan penilaian otomatis.
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
