"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@classroom/ui/button";
import { Card } from "@classroom/ui/card";
import { Input } from "@classroom/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@classroom/ui/select";
import { env } from "@classroom/config/env";
import { cn } from "@classroom/ui/cn";

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
        <Input
          label="Nama Lengkap"
          placeholder="Nama Anda"
          value={formState.name}
          onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
          disabled={isDisabled}
          required
        />
        <Input
          type="email"
          label="Email"
          placeholder="email@domain.com"
          value={formState.email}
          onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
          disabled={isDisabled}
          required
        />
        <Input
          label="Nomor WhatsApp"
          placeholder="08xxxxxxxxxx"
          value={formState.phone}
          onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
          disabled={isDisabled}
          required
        />
        <div className="grid gap-2">
          <label className="text-sm font-medium">Program Pilihan</label>
          <Select
            value={formState.programId}
            onValueChange={(value) => setFormState((prev) => ({ ...prev, programId: value }))}
            disabled={isDisabled}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web">Web Development</SelectItem>
              <SelectItem value="uiux">UI/UX</SelectItem>
              <SelectItem value="data">Data Science</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <textarea
          className={cn(
            "min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isDisabled && "opacity-60"
          )}
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
