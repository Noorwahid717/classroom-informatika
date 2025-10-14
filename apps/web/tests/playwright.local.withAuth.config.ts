import base from './playwright.local.config'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  ...base,
  use: {
    ...(base as any).use,
    storageState: 'tests/e2e/helpers/auth.json'
  }
})
