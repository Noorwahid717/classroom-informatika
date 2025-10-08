CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT substr(hex(randomblob(16)), 1, 24),
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT,
  "needsPasswordRehash" BOOLEAN NOT NULL DEFAULT false,
  "googleId" TEXT UNIQUE,
  "name" TEXT,
  "avatarUrl" TEXT,
  "role" TEXT NOT NULL DEFAULT 'STUDENT',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
