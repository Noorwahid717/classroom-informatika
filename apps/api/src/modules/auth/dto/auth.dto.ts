import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const AuthCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export class AuthCredentialsDto extends createZodDto(AuthCredentialsSchema) {}

export const GoogleAuthSchema = z.object({
  email: z.string().email(),
  googleId: z.string(),
  name: z.string().min(2),
  avatarUrl: z.string().url().optional()
});

export class GoogleAuthDto extends createZodDto(GoogleAuthSchema) {}
