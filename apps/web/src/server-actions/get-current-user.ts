"use server";

import { env } from "../config/env";
import { z } from "zod";
import { auth } from "@/auth";

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: z.enum(["ADMIN", "MENTOR", "STUDENT"])
});

export type CurrentUser = z.infer<typeof UserSchema>;

const SessionResponseSchema = z.object({
  user: UserSchema
});

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  if (!session?.accessToken) {
    return null;
  }

  const response = await fetch(`${env.API_BASE_URL}/auth/session`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as unknown;
  const parsed = SessionResponseSchema.safeParse(json);
  return parsed.success ? parsed.data.user : null;
}
