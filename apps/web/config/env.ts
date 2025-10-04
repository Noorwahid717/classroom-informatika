export const env = {
  API_BASE_URL: process.env.API_BASE_URL ?? "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME ?? "",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY ?? "",
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "",
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN ?? ""
};
