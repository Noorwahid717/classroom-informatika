"use server";

import { z } from "zod";
import { env } from "../config/env";
import "server-only";

const StatSchema = z.object({
  label: z.string(),
  value: z.number()
});

export type Stat = z.infer<typeof StatSchema>;

export async function getStats(): Promise<Stat[]> {
  const fallbackStats: Stat[] = [
    { label: "Peserta", value: 0 },
    { label: "Kelas Aktif", value: 0 },
    { label: "Tugas", value: 0 },
    { label: "Mentor", value: 0 }
  ];

  if (!env.API_BASE_URL) {
    console.warn("API_BASE_URL is not configured, returning fallback stats");
    return fallbackStats;
  }

  const response = await fetch(`${env.API_BASE_URL}/stats`, {
    headers: {
      "x-api-key": env.INTERNAL_API_KEY
    },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    console.error("Failed to fetch stats", await response.text());
    return fallbackStats;
  }

  const data = (await response.json()) as unknown;
  const parsed = z.array(StatSchema).safeParse(data);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    return fallbackStats;
  }
  return parsed.data;
}
