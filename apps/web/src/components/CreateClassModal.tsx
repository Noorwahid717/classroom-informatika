"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const CreateClassSchema = z.object({
  name: z
    .string()
    .min(3, "Nama kelas minimal 3 karakter")
    .max(100, "Nama kelas maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .transform((value) => value?.trim() ?? ""),
  semester: z
    .string()
    .min(3, "Semester harus diisi")
    .max(50, "Semester terlalu panjang"),
  year: z
    .string()
    .regex(/^[0-9]{4}$/, "Tahun harus 4 digit")
});

export type CreateClassInput = z.infer<typeof CreateClassSchema>;

interface CreateClassModalProps {
  onClassCreated?: () => void;
}

export default function CreateClassModal({ onClassCreated }: CreateClassModalProps) {
  const [open, setOpen] = useState(false);
  const { addToast } = useToast();
  const form = useForm<CreateClassInput>({
    resolver: zodResolver(CreateClassSchema),
    defaultValues: {
      name: "",
      description: "",
      semester: "Ganjil 2024/2025",
      year: "2024"
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error("Gagal membuat kelas");
      }

      addToast({
        type: "success",
        title: "Kelas dibuat",
        message: "Kelas baru berhasil dibuat"
      });

      form.reset({
        name: "",
        description: "",
        semester: "Ganjil 2024/2025",
        year: "2024"
      });
      setOpen(false);
      onClassCreated?.();
    } catch (error) {
      console.error("Error creating class", error);
      addToast({
        type: "error",
        title: "Gagal",
        message: error instanceof Error ? error.message : "Terjadi kesalahan"
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Create a new class for your students to join and participate in assignments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name *</Label>
            <Input id="name" {...form.register("name")} placeholder="e.g., Informatika XI-A" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              {...form.register("description")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Brief description of the class..."
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Input id="semester" {...form.register("semester")} placeholder="e.g., Ganjil 2024/2025" />
              {form.formState.errors.semester && (
                <p className="text-sm text-red-600">{form.formState.errors.semester.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input id="year" {...form.register("year")} placeholder="e.g., 2024" />
              {form.formState.errors.year && (
                <p className="text-sm text-red-600">{form.formState.errors.year.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
