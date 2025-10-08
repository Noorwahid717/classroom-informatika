import { describe, expect, it } from "vitest";
import { hasPermission } from "@/lib/rbac";

describe("RBAC permission matrix", () => {
  it("allows mentors to grade submissions", () => {
    expect(hasPermission("MENTOR", "submission:grade")).toBe(true);
  });

  it("prevents students from grading submissions", () => {
    expect(hasPermission("STUDENT", "submission:grade")).toBe(false);
  });

  it("grants super admin universal access", () => {
    expect(hasPermission("SUPER_ADMIN", "user:manage")).toBe(true);
    expect(hasPermission("SUPER_ADMIN", "assignment:manage")).toBe(true);
  });
});
