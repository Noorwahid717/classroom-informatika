"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Phone, MapPin, Users, GraduationCap, BookOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/Toast";

const StudentRegisterSchema = z
  .object({
    studentId: z.string().min(6, "NIS minimal 6 karakter").max(20, "NIS maksimal 20 karakter"),
    fullName: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
    class: z.string().min(1, "Pilih kelas"),
    phone: z
      .string()
      .min(10, "Nomor telepon minimal 10 digit")
      .max(15, "Nomor telepon maksimal 15 digit")
      .optional()
      .or(z.literal("")),
    address: z.string().max(200, "Alamat maksimal 200 karakter").optional().or(z.literal("")),
    parentName: z.string().max(100, "Nama orang tua maksimal 100 karakter").optional().or(z.literal("")),
    parentPhone: z
      .string()
      .min(10, "Nomor telepon orang tua minimal 10 digit")
      .max(15, "Nomor telepon orang tua maksimal 15 digit")
      .optional()
      .or(z.literal(""))
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password dan konfirmasi password tidak cocok"
  });

type StudentRegisterInput = z.infer<typeof StudentRegisterSchema>;

const STATUS_CLASSES: Record<"info" | "success" | "error", string> = {
  info: "mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-600",
  success: "mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-600",
  error: "mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600"
};

export default function StudentRegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"info" | "success" | "error" | null>(null);

  const form = useForm<StudentRegisterInput>({
    resolver: zodResolver(StudentRegisterSchema),
    defaultValues: {
      studentId: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      class: "",
      phone: "",
      address: "",
      parentName: "",
      parentPhone: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setStatusType("info");
    setStatusMessage("Memproses registrasi siswa...");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...values, userType: "student" })
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        const message = data.message ?? "Registrasi gagal. Silakan coba lagi.";
        setStatusType("error");
        setStatusMessage(message);
        form.setError("root", { type: "manual", message });
        addToast({ type: "error", title: "Registrasi gagal", message });
        return;
      }

      setStatusType("success");
      setStatusMessage("Registrasi berhasil! Mengalihkan ke halaman login...");
      addToast({ type: "success", title: "Registrasi berhasil", message: "Silakan login untuk melanjutkan" });
      setTimeout(() => {
        router.push("/student/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error", error);
      const message = "Terjadi kesalahan. Silakan coba lagi.";
      setStatusType("error");
      setStatusMessage(message);
      form.setError("root", { type: "manual", message });
      addToast({ type: "error", title: "Registrasi gagal", message });
    }
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-green-400 px-4 py-12">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-green-300 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
            <GraduationCap className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">Daftar Siswa GEMA</h1>
          <p className="text-lg text-blue-100">Bergabunglah dengan Generasi Muda Informatika SMA Wahidiyah Kediri</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm"
        >
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <User className="mr-2 inline h-4 w-4" /> NIS / Student ID
                </label>
                <input
                  type="text"
                  {...form.register("studentId")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: 2024001"
                  disabled={form.formState.isSubmitting}
                />
                {form.formState.errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.studentId.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <User className="mr-2 inline h-4 w-4" /> Nama Lengkap
                </label>
                <input
                  type="text"
                  {...form.register("fullName")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama lengkap sesuai rapor"
                  disabled={form.formState.isSubmitting}
                />
                {form.formState.errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.fullName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Mail className="mr-2 inline h-4 w-4" /> Email
                </label>
                <input
                  type="email"
                  {...form.register("email")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                  disabled={form.formState.isSubmitting}
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <BookOpen className="mr-2 inline h-4 w-4" /> Kelas
                </label>
                <select
                  {...form.register("class")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={form.formState.isSubmitting}
                >
                  <option value="">Pilih Kelas</option>
                  <option value="X-A">X-A</option>
                  <option value="X-B">X-B</option>
                  <option value="X-C">X-C</option>
                  <option value="XI-A">XI-A</option>
                  <option value="XI-B">XI-B</option>
                  <option value="XI-C">XI-C</option>
                  <option value="XII-A">XII-A</option>
                  <option value="XII-B">XII-B</option>
                  <option value="XII-C">XII-C</option>
                </select>
                {form.formState.errors.class && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.class.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimal 8 karakter"
                    disabled={form.formState.isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={form.formState.isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...form.register("confirmPassword")}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ulangi password"
                    disabled={form.formState.isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-700"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={form.formState.isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Phone className="mr-2 inline h-4 w-4" /> No. Telepon
                </label>
                <input
                  type="tel"
                  {...form.register("phone")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="08123456789"
                  disabled={form.formState.isSubmitting}
                />
                {form.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Users className="mr-2 inline h-4 w-4" /> Nama Orang Tua/Wali
                </label>
                <input
                  type="text"
                  {...form.register("parentName")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama orang tua atau wali"
                  disabled={form.formState.isSubmitting}
                />
                {form.formState.errors.parentName && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.parentName.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <MapPin className="mr-2 inline h-4 w-4" /> Alamat
                </label>
                <input
                  type="text"
                  {...form.register("address")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Alamat lengkap"
                  disabled={form.formState.isSubmitting}
                />
                {form.formState.errors.address && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Phone className="mr-2 inline h-4 w-4" /> Telepon Orang Tua
                </label>
                <input
                  type="tel"
                  {...form.register("parentPhone")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="08123456789"
                  disabled={form.formState.isSubmitting}
                />
                {form.formState.errors.parentPhone && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.parentPhone.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-green-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center">
                  <span className="mr-2 inline-flex h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                  Mendaftar...
                </span>
              ) : (
                "📚 Daftar Sebagai Siswa GEMA"
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                Sudah punya akun? {" "}
                <Link href="/student/login" className="font-semibold text-blue-600 hover:text-blue-700">
                  Login di sini
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center text-white/80 transition-colors hover:text-white">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
