import { test, expect } from "@playwright/test";

test.describe("Auth flow", () => {
  test("renders student login page", async ({ page }) => {
    await page.goto("/student/login");
    await expect(page.getByRole("heading", { name: /login siswa/i })).toBeVisible();
    await expect(page.getByLabel(/student id/i)).toBeVisible();
  });
});
