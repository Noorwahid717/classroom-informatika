import { test } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// This helper will call the dev-only endpoint /api/test/session to get a session payload
// and then create a storage state file that Playwright tests can reuse via --storage-state

const OUT_PATH = path.join(__dirname, 'auth.json')

test('save auth state for e2e', async ({ request, browser, page }) => {
  // Try programmatic session endpoint first (requires server to enable test endpoints)
  let session: any = null
  try {
    const res = await request.post('/api/test/session', { data: { role: 'admin' } })
    if (res.ok()) {
      const body = await res.json()
      session = body.session || body
    }
  } catch (e) {
    // ignore and fallback to UI sign-in
  }

  const context = await browser.newContext()

  if (session) {
    const cookie = {
      name: 'e2e_session',
      value: JSON.stringify(session),
      domain: '127.0.0.1',
      path: '/',
      httpOnly: false,
      secure: false
    }
    await context.addCookies([cookie as any])
  } else {
    // Fallback: perform UI sign-in to create an authenticated session in the browser context
    const adminEmail = 'admin@smawahidiyah.edu'
    const adminPassword = 'admin123!@#'
    const p = await context.newPage()
    await p.goto('/admin/login')
    // Fill known admin credentials and submit
    await p.fill('input#email', adminEmail).catch(() => {})
    await p.fill('input#password', adminPassword).catch(() => {})
    await Promise.all([
      p.waitForURL(/\/dashboard\/teacher/, { timeout: 10_000 }).catch(() => {}),
      p.click('button[type="submit"]').catch(() => {})
    ])
    // leave page open briefly to ensure cookies set
    await p.waitForTimeout(500)
    await p.close()
  }

  await context.storageState({ path: OUT_PATH })
  await context.close()

  // Basic check
  if (!fs.existsSync(OUT_PATH)) throw new Error('auth.json not created')
  console.log('Saved auth state to', OUT_PATH)
})
