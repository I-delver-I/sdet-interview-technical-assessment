import { Locator, Page } from '@playwright/test';
import { ADDONS_INFO, IP_ADDRESS } from '../tests/data/testData';
import ReviewOrderPage from './reviewOrderPage';

export default class ConfigureOrderPage {
  readonly page: Page;
  private readonly configureHeader: Locator;
  private readonly ipAddressInput: Locator;
  private readonly addonCards: Locator;
  private readonly selectedAddons: Locator;
  private readonly selectedAddonNames: Locator;
  private readonly selectedAddonPrices: Locator;
  private readonly continueButton: Locator;
  private readonly orderSummary: Locator;
  private readonly orderSummaryAddonNames: Locator;
  private readonly orderSummaryAddonPrices: Locator;

  constructor(page: Page) {
    this.page = page;
    this.configureHeader = page.locator('h1');
    this.ipAddressInput = page.getByLabel('IP Address *');
    this.addonCards = page.locator('.addon-products .card');
    this.selectedAddons = this.addonCards.filter({
      has: page.locator('.panel-addon-selected'),
    });
    this.selectedAddonNames = this.selectedAddons.locator('label');
    this.selectedAddonPrices = this.selectedAddons.locator('.panel-price');
    this.continueButton = page.locator('#btnCompleteProductConfig');
    this.orderSummary = page.locator('#producttotal');
    this.orderSummaryAddonNames = this.orderSummary.locator(
      '.clearfix:has(span.pull-left:has-text("+")) .pull-left',
    );
    this.orderSummaryAddonPrices = this.orderSummary.locator(
      '.clearfix:has(span.pull-left:has-text("+")) .pull-right',
    );
  }

  async clickContinueButton() {
    await this.continueButton.click();
    const reviewOrderPage = new ReviewOrderPage(this.page);
    await reviewOrderPage.waitForReviewHeader();

    return reviewOrderPage;
  }

  async isOrderSummaryUpdatedWithAddons() {
    const selectedAddonNames = await this.selectedAddonNames.allInnerTexts();
    const selectedAddonPrices = await this.selectedAddonPrices.allInnerTexts();
    const orderSummaryAddonNames =
      await this.orderSummaryAddonNames.allInnerTexts();
    const orderSummaryAddonPrices =
      await this.orderSummaryAddonPrices.allInnerTexts();

    for (let i = 0; i < orderSummaryAddonNames.length; i++) {
      const summaryName = orderSummaryAddonNames[i];
      const summaryPrice = orderSummaryAddonPrices[i];

      const found = selectedAddonNames.some(
        (selectedName, idx) =>
          selectedName.includes(summaryName) &&
          selectedAddonPrices[idx].includes(summaryPrice),
      );

      if (!found) {
        return false;
      }
    }

    return true;
  }

  private getAddonCard(addonName: string) {
    return this.addonCards.filter({
      has: this.page.locator(`label:has-text("${addonName}")`),
    });
  }

  private getAddToCartButton(addonCard: Locator) {
    return addonCard.locator('.panel-add');
  }

  async selectAddons() {
    for (const addon of ADDONS_INFO) {
      const addonCard = this.getAddonCard(addon.name);
      const addToCartButton = this.getAddToCartButton(addonCard);
      await addToCartButton.click();
    }
  }

  async enterIPAddress() {
    await this.ipAddressInput.fill(IP_ADDRESS);
  }

  async waitForConfigureHeader() {
    await this.configureHeader.waitFor({ state: 'visible' });
  }
}
