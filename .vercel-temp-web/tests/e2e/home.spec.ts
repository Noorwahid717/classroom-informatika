import { test, expect } from '@playwright/test'

test('homepage has title or heading', async ({ page }) => {
  // Adjust the URL if the dev server runs on a different port in CI
  await page.goto(process.env.PW_BASE_URL ?? 'http://localhost:3000/')

  // Prefer checking document title, fall back to a common heading
  const title = await page.title()
  if (title && title.length > 0) {
    expect(title.length).toBeGreaterThan(0)
  } else {
    // Look for a common element like site heading or nav
    const h1 = await page.locator('h1').first()
    await expect(h1).toHaveCount(1)
  }
})
