import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { createTestPrisma } from "../utils/prisma-test-context";

describe("Prisma test context", () => {
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = await createTestPrisma();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it("creates a user record", async () => {
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        passwordHash: "hashed",
        role: "STUDENT"
      }
    });

    expect(user.email).toBe("test@example.com");
  });
});
