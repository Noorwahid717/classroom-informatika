"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/Toast";

const STATUS_CLASSES: Record<"info" | "success" | "error", string> = {
  info: "mb-4 flex items-center rounded border border-blue-400 bg-blue-100 px-4 py-3 text-blue-700",
  success: "mb-4 flex items-center rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700",
  error: "mb-4 flex items-center rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
};

const AdminLoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter")
});

type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export default function AdminLogin() {
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"info" | "success" | "error" | null>(null);
  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setStatusType("info");
    setStatusMessage("Memverifikasi kredensial...");
    const result = await signIn("admin", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      const message =
        result.error === "Configuration"
          ? "Konfigurasi autentikasi belum lengkap. Hubungi administrator."
          : "Email atau password salah. Silakan periksa kembali.";
      setStatusType("error");
      setStatusMessage(message);
      form.setError("root", { type: "manual", message });
      addToast({ type: "error", title: "Login gagal", message });
      return;
    }

    setStatusType("success");
    setStatusMessage("Login berhasil! Mengalihkan ke dashboard...");
    addToast({ type: "success", title: "Berhasil masuk", message: "Selamat datang kembali" });
    setTimeout(() => {
      window.location.href = "/admin/dashboard";
    }, 1500);
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-green-400 p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-green-300 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white p-2 shadow-lg">
            <Image src="/gema.svg" alt="GEMA - Generasi Muda Informatika Logo" width={60} height={60} className="h-14 w-14" priority />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-white/80">GEMA - SMA Wahidiyah Kediri</p>
        </div>

        <div className="rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Masuk Admin</h2>

          {statusType && statusMessage ? (
            <div className={STATUS_CLASSES[statusType]}>
              {statusType === "info" && <span className="mr-3 inline-flex h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />}
              {statusMessage}
            </div>
          ) : null}

          {form.formState.errors.root?.message ? (
            <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {form.formState.errors.root.message}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Admin
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@smawahidiyah.edu"
                  disabled={form.formState.isSubmitting}
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan password"
                  disabled={form.formState.isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-green-500 px-4 py-3 font-medium text-white transition-all duration-200 hover:from-blue-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {form.formState.isSubmitting && (
                <span className="mr-2 inline-flex h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
              )}
              {statusType === "success" ? "Berhasil! Mengalihkan..." : form.formState.isSubmitting ? "Memproses..." : "🔐 Masuk Admin"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Hanya admin yang memiliki akses ke panel ini</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm font-medium text-white/80 transition-colors hover:text-white">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
