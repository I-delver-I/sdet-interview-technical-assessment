import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 50_000,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
