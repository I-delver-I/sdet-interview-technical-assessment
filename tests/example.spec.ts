import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://example.com');

  // Expect page title
  await expect(page).toHaveTitle('Example Domain');

  // Expect header text
  const header = page.locator('h1');
  await expect(header).toHaveText('Example Domain');

  // Screenshot test
  await expect(page).toHaveScreenshot('homepage.png');
});
