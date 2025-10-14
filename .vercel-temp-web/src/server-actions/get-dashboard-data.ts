"use server";

import "server-only";
import { env } from "../config/env";
import { z } from "zod";
import { auth } from "@/auth";

const DashboardSchema = z.object({
  summary: z.object({
    applicants: z.number(),
    activeClasses: z.number(),
    pendingAssignments: z.number()
  }),
  trends: z.object({
    applicants: z.number(),
    classes: z.number(),
    assignments: z.number()
  }),
  columns: z.array(z.object({ header: z.string(), accessorKey: z.string() })),
  rows: z.array(z.record(z.any()))
});

export type DashboardData = z.infer<typeof DashboardSchema>;

export async function getDashboardData(): Promise<DashboardData> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${env.API_BASE_URL}/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load dashboard data");
  }

  const json = (await response.json()) as unknown;
  const parsed = DashboardSchema.safeParse(json);
  if (!parsed.success) {
    throw parsed.error;
  }

  return parsed.data;
}
