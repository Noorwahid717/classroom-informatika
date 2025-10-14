"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, GraduationCap } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/Toast";

const StudentLoginSchema = z.object({
  studentId: z
    .string()
    .min(6, "NIS minimal 6 karakter")
    .max(20, "NIS maksimal 20 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter")
});

type StudentLoginInput = z.infer<typeof StudentLoginSchema>;

const STATUS_CLASSES: Record<"info" | "success" | "error", string> = {
  info: "mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-600",
  success: "mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-600",
  error: "mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600"
};

export default function StudentLoginPage() {
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"info" | "success" | "error" | null>(null);
  const form = useForm<StudentLoginInput>({
    resolver: zodResolver(StudentLoginSchema),
    defaultValues: {
      studentId: "",
      password: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setStatusType("info");
    setStatusMessage("Memverifikasi data siswa...");
    const result = await signIn("student", {
      studentId: values.studentId,
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      const message = "NIS atau password salah. Silakan periksa data Anda.";
      setStatusType("error");
      setStatusMessage(message);
      form.setError("root", { type: "manual", message });
      addToast({ type: "error", title: "Login gagal", message });
      return;
    }

    setStatusType("success");
    setStatusMessage("Login berhasil! Mengalihkan ke dashboard...");
    addToast({ type: "success", title: "Selamat datang", message: "Mengalihkan ke dashboard siswa" });
    setTimeout(() => {
      window.location.href = "/student/dashboard";
    }, 1500);
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-green-500 via-blue-600 to-purple-500 p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-green-300 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
            <GraduationCap className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">Login Siswa</h1>
          <p className="text-lg text-green-100">GEMA - SMA Wahidiyah Kediri</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm"
        >
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold text-gray-800">Masuk Siswa</h2>
            <p className="text-gray-600">Akses materi dan tugas pembelajaran</p>
          </div>

          {statusType && statusMessage ? (
            <div className={STATUS_CLASSES[statusType]}>
              {statusType === "info" && (
                <span className="mr-3 inline-flex h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600 align-middle" />
              )}
              {statusMessage}
            </div>
          ) : null}

          {form.formState.errors.root?.message ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {form.formState.errors.root.message}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="studentId" className="mb-2 block text-sm font-medium text-gray-700">
                NIS / Student ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="studentId"
                  type="text"
                  {...form.register("studentId")}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Masukkan NIS Anda"
                  disabled={form.formState.isSubmitting}
                />
              </div>
              {form.formState.errors.studentId && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.studentId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Masukkan password"
                  disabled={form.formState.isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700"
                  disabled={form.formState.isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-green-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {form.formState.isSubmitting && (
                <span className="mr-2 inline-flex h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
              )}
              {statusType === "success" ? "Berhasil! Mengalihkan..." : form.formState.isSubmitting ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun? {" "}
              <Link href="/student/register" className="font-semibold text-green-600 hover:text-green-700">
                Daftar sebagai siswa baru
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
