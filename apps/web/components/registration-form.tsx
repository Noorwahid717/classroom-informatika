"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { env } from "../config/env";
import { Button, Card, Input } from "./ui/primitives";

const RegistrationSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(9),
  programId: z.string(),
  motivation: z.string().min(10)
});

type RegistrationInput = z.infer<typeof RegistrationSchema>;

export function RegistrationForm() {
  const [message, setMessage] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: async (payload: RegistrationInput) => {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => setMessage("Pendaftaran berhasil, silakan cek email Anda."),
    onError: (error: unknown) => setMessage(error instanceof Error ? error.message : "Terjadi kesalahan")
  });

  const [formState, setFormState] = useState<RegistrationInput>({
    name: "",
    email: "",
    phone: "",
    programId: "",
    motivation: ""
  });

  const isDisabled = mutation.isPending;

  return (
    <Card className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-semibold">Form Pendaftaran</h1>
        <p className="text-sm text-muted-foreground">Lengkapi data berikut untuk bergabung dengan program GEMA.</p>
      </div>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const result = RegistrationSchema.safeParse(formState);
          if (!result.success) {
            setMessage("Data belum valid, mohon cek kembali.");
            return;
          }
          mutation.mutate(result.data);
        }}
      >
        <div className="grid gap-2">
          <label className="text-sm font-medium">Nama Lengkap</label>
          <Input
            placeholder="Nama Anda"
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            disabled={isDisabled}
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            placeholder="email@domain.com"
            value={formState.email}
            onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
            disabled={isDisabled}
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Nomor WhatsApp</label>
          <Input
            placeholder="08xxxxxxxxxx"
            value={formState.phone}
            onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
            disabled={isDisabled}
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Program Pilihan</label>
          <select
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            value={formState.programId}
            onChange={(event) => setFormState((prev) => ({ ...prev, programId: event.target.value }))}
            disabled={isDisabled}
            required
          >
            <option value="" disabled>
              Pilih program
            </option>
            <option value="web">Web Development</option>
            <option value="uiux">UI/UX</option>
            <option value="data">Data Science</option>
          </select>
        </div>
        <textarea
          className="min-h-[120px] w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          placeholder="Ceritakan motivasi Anda"
          value={formState.motivation}
          onChange={(event) => setFormState((prev) => ({ ...prev, motivation: event.target.value }))}
          disabled={isDisabled}
          required
        />
        <Button type="submit" disabled={isDisabled} className="w-full">
          {isDisabled ? "Mengirim..." : "Kirim Pendaftaran"}
        </Button>
      </form>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </Card>
  );
}
