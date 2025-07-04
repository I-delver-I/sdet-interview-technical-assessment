import { Locator, Page } from '@playwright/test';
import ConfigureOrderPage from './configureOrderPage';
import { PRODUCT_INFO } from '../tests/data/testData';

export default class ProductCategoryPage {
  readonly page: Page;
  private readonly productCategoryHeader: Locator;
  private readonly productCard: Locator;
  private readonly orderProductButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productCategoryHeader = page.locator('h1');
    this.productCard = page.locator(`.product:has-text("${PRODUCT_INFO.name}")`);
    this.orderProductButton = this.productCard.locator('a');
  }

  async clickOrderProductButton() {
    await this.orderProductButton.click();
    const configureProductPage = new ConfigureOrderPage(this.page);
    await configureProductPage.waitForConfigureHeader();

    return configureProductPage;
  }

  async waitForProductCategoryHeader() {
    await this.productCategoryHeader.waitFor({ state: 'visible' });
  }
}
