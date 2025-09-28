"use server";

import { z } from "zod";
import { env } from "@classroom/config/env";
import "server-only";

const StatSchema = z.object({
  label: z.string(),
  value: z.number()
});

export type Stat = z.infer<typeof StatSchema>;

export async function getStats(): Promise<Stat[]> {
  const response = await fetch(`${env.API_BASE_URL}/stats`, {
    headers: {
      "x-api-key": env.INTERNAL_API_KEY
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    console.error("Failed to fetch stats", await response.text());
    return [
      { label: "Peserta", value: 0 },
      { label: "Kelas Aktif", value: 0 },
      { label: "Tugas", value: 0 },
      { label: "Mentor", value: 0 }
    ];
  }

  const data = await response.json();
  const parsed = z.array(StatSchema).safeParse(data);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return [];
  }
  return parsed.data;
}
