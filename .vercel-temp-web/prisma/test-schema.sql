-- Dummy test schema for Prisma tests
-- Silakan sesuaikan dengan schema asli jika diperlukan
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
);
