import { Locator, Page } from '@playwright/test';
import ProductCategoryPage from './productCategoryPage';
import { BASE_URL, PRODUCT_CATEGORY_NAME } from '../tests/data/testData';

export default class HomePage {
  readonly page: Page;
  private readonly productCategoryCard: Locator;
  private readonly orderNowButton: Locator;
  private readonly accountDropdown: Locator;
  private readonly loginMenuItem: Locator;
  private readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCategoryCard = page.locator(
      `.card-body:has-text("${PRODUCT_CATEGORY_NAME}")`,
    );
    this.orderNowButton = this.productCategoryCard.locator('a');
    this.accountDropdown = page.locator('#mainNavbar a:has-text("Account")');
    this.loginMenuItem = page.locator('li[menuitemname="Login"]');
    this.mobileMenuButton = page.locator('header button');
  }

  async isUserLoggedIn(): Promise<boolean> {
    const viewportSize = this.page.viewportSize();
    const isMobileView = viewportSize && viewportSize.width < 1200;

    if (isMobileView) {
      await this.mobileMenuButton.click();
    }

    await this.accountDropdown.click();
    const menuItemText = await this.loginMenuItem.innerText();

    return menuItemText.trim() !== 'Login';
  }

  async visit() {
    await this.page.goto(BASE_URL);
  }

  async clickOrderNowButton(): Promise<ProductCategoryPage> {
    await this.orderNowButton.click();
    const productCategoryPage = new ProductCategoryPage(this.page);
    await productCategoryPage.waitForProductCategoryHeader();

    return productCategoryPage;
  }
}
