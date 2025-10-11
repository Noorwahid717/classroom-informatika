"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, GraduationCap, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentLoginSchema = z.object({
  studentId: z
    .string()
    .min(6, "Student ID minimal 6 karakter")
    .max(20, "Student ID maksimal 20 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter")
});

const AdminLoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter")
});

type StudentLoginInput = z.infer<typeof StudentLoginSchema>;
type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"student" | "admin">("student");

  const studentForm = useForm<StudentLoginInput>({
    resolver: zodResolver(StudentLoginSchema),
    defaultValues: {
      studentId: "",
      password: ""
    }
  });

  const adminForm = useForm<AdminLoginInput>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleStudentLogin = studentForm.handleSubmit(async (values) => {
    studentForm.clearErrors("root");
    const result = await signIn("student", {
      studentId: values.studentId,
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      studentForm.setError("root", {
        type: "manual",
        message: "Student ID atau password salah"
      });
      return;
    }

    addToast({
      type: "success",
      title: "Berhasil masuk",
      message: "Selamat belajar!"
    });
    onClose();
    window.location.href = "/dashboard/student";
  });

  const handleAdminLogin = adminForm.handleSubmit(async (values) => {
    adminForm.clearErrors("root");
    const result = await signIn("admin", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (result?.error) {
      adminForm.setError("root", {
        type: "manual",
        message: "Email atau password salah"
      });
      return;
    }

    addToast({
      type: "success",
      title: "Berhasil masuk",
      message: "Selamat datang kembali"
    });
    onClose();
    window.location.href = "/dashboard/teacher";
  });

  const activeError =
    activeTab === "student"
      ? studentForm.formState.errors.root?.message
      : adminForm.formState.errors.root?.message;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 sm:max-w-[500px]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-center text-2xl">Login ke Classroom Informatika</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as "student" | "admin")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Siswa</span>
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span>Guru/Admin</span>
              </TabsTrigger>
            </TabsList>

            {activeError ? (
              <div className="mt-4 flex items-center space-x-2 rounded-md border border-red-200 bg-red-50 p-3">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{activeError}</span>
              </div>
            ) : null}

            <TabsContent value="student" className="mt-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Login Siswa</CardTitle>
                  <CardDescription>Masukkan Student ID dan password yang diberikan guru</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleStudentLogin}>
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="Contoh: 2024001"
                        {...studentForm.register("studentId")}
                        disabled={studentForm.formState.isSubmitting}
                      />
                      {studentForm.formState.errors.studentId && (
                        <p className="text-sm text-red-600">{studentForm.formState.errors.studentId.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="studentPassword">Password</Label>
                      <Input
                        id="studentPassword"
                        type="password"
                        placeholder="Masukkan password"
                        {...studentForm.register("password")}
                        disabled={studentForm.formState.isSubmitting}
                      />
                      {studentForm.formState.errors.password && (
                        <p className="text-sm text-red-600">{studentForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={studentForm.formState.isSubmitting}>
                      {studentForm.formState.isSubmitting ? "Masuk..." : "Masuk sebagai Siswa"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="mt-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Login Guru/Admin</CardTitle>
                  <CardDescription>Masukkan email dan password admin</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleAdminLogin}>
                    <div>
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@smawahidiyah.edu"
                        {...adminForm.register("email")}
                        disabled={adminForm.formState.isSubmitting}
                      />
                      {adminForm.formState.errors.email && (
                        <p className="text-sm text-red-600">{adminForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="adminPassword">Password</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        placeholder="Masukkan password"
                        {...adminForm.register("password")}
                        disabled={adminForm.formState.isSubmitting}
                      />
                      {adminForm.formState.errors.password && (
                        <p className="text-sm text-red-600">{adminForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={adminForm.formState.isSubmitting}>
                      {adminForm.formState.isSubmitting ? "Masuk..." : "Masuk sebagai Guru/Admin"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Belum punya akun? Hubungi admin untuk registrasi</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
