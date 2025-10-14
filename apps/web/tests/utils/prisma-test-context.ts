import { readFileSync } from "node:fs";
import path from "node:path";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export async function createTestPrisma(): Promise<PrismaClient> {
  // Gunakan Pool dari pg dan PrismaPg
  // Pastikan DATABASE_URL test environment sudah di-setup
  const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/test";
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}
