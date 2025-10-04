import { chromium } from "playwright";

export interface SubmissionContext {
  previewUrl: string | null;
}

export async function runPlaywright(submission: SubmissionContext) {
  if (!submission.previewUrl) {
    return { success: false, reason: "No preview URL" };
  }
  const browser = await chromium.launch({ args: ["--no-sandbox"], headless: true });
  const page = await browser.newPage();
  await page.goto(submission.previewUrl, { waitUntil: "networkidle" });
  const title = await page.title();
  await browser.close();
  return { success: true, title };
}
