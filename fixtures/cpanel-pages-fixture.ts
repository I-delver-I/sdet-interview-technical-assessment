import { test as base } from '@playwright/test';
import HomePage from '../pages/homePage';

type UIPages = {
  homePage: HomePage;
};

export const test = base.extend<UIPages>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
});
