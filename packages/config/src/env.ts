import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    API_BASE_URL: z.string().url(),
    INTERNAL_API_KEY: z.string().min(16),
    AUTH_COOKIE_NAME: z.string().min(5),
    NEXTAUTH_SECRET: z.string().optional(),
    NEXTAUTH_URL: z.string().url().optional(),
    JWT_SECRET: z.string().min(16),
    DATABASE_URL: z.string(),
    REDIS_URL: z.string().url(),
    SENTRY_DSN: z.string().url().optional(),
    STORAGE_R2_ACCOUNT_ID: z.string(),
    STORAGE_R2_ACCESS_KEY_ID: z.string(),
    STORAGE_R2_SECRET_ACCESS_KEY: z.string(),
    STORAGE_R2_BUCKET: z.string(),
    STORAGE_R2_PUBLIC_URL: z.string().url(),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
    GOOGLE_CLIENT_ID: z.string().min(10),
    GOOGLE_CLIENT_SECRET: z.string().min(10)
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional()
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    API_BASE_URL: process.env.API_BASE_URL,
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    STORAGE_R2_ACCOUNT_ID: process.env.STORAGE_R2_ACCOUNT_ID,
    STORAGE_R2_ACCESS_KEY_ID: process.env.STORAGE_R2_ACCESS_KEY_ID,
    STORAGE_R2_SECRET_ACCESS_KEY: process.env.STORAGE_R2_SECRET_ACCESS_KEY,
    STORAGE_R2_BUCKET: process.env.STORAGE_R2_BUCKET,
    STORAGE_R2_PUBLIC_URL: process.env.STORAGE_R2_PUBLIC_URL,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN
  },
  skipValidation: !!process.env.CI,
  emptyStringAsUndefined: true
});
