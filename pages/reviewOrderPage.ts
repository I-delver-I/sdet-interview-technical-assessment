import { Locator, Page } from '@playwright/test';
import { PRODUCT_INFO, ADDONS_INFO } from '../tests/data/testData';
import {
  calculateExpectedSubtotalPrice,
  calculateProratedPrice,
  getDirectTextOnly,
  parsePrice,
} from '../utils/utils';
import CheckoutOrderPage from './checkoutOrderPage';

export default class ReviewOrderPage {
  readonly page: Page;
  private readonly reviewHeader: Locator;
  private readonly cartItems: Locator;
  private readonly productItem: Locator;
  private readonly productSubtotalPrice: Locator;
  private readonly productItemName: Locator;
  private readonly productProratedItemPrice: Locator;
  private readonly addonItems: Locator;
  private readonly addonItemPrices: Locator;
  private readonly addonItemNames: Locator;
  private readonly addonProratedItemPrices: Locator;
  private readonly subtotalProratedPrice: Locator;
  private readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('#checkout');
    this.reviewHeader = page.locator('h1');
    this.cartItems = page.locator('.view-cart-items');
    this.productItem = page.locator(
      '.item:has(.item-group:has-text("cPanel Licenses"))',
    );
    this.productSubtotalPrice = this.productItem.locator('.item-price .cycle');
    this.productProratedItemPrice = this.productItem.locator(
      '.item-price span:not(.cycle)',
    );
    this.productItemName = this.productItem.locator('.item-title');
    this.addonItems = this.cartItems.locator(
      '.item:has(.item-group:has-text("Addon"))',
    );
    this.addonItemPrices = this.addonItems.locator('.item-price .cycle');
    this.addonProratedItemPrices = this.addonItems.locator(
      '.item-price span:not(.cycle)',
    );
    this.addonItemNames = this.addonItems.locator('.item-title');
    this.subtotalProratedPrice = page.locator('#subtotal');
  }

  async clickCheckoutButton() {
    await this.checkoutButton.click();
    const checkoutOrderPage = new CheckoutOrderPage(this.page);
    await checkoutOrderPage.waitForCheckoutHeader();

    return checkoutOrderPage;
  }

  private async isSubtotalPriceCorrect() {
    const productSubtotalPrice = parsePrice(
      await this.productSubtotalPrice.innerText(),
    );
    const expectedProductSubtotalPrice = calculateExpectedSubtotalPrice(false);

    return productSubtotalPrice === expectedProductSubtotalPrice;
  }

  private async isProratedSubtotalPriceCorrect() {
    const proratedSubtotalPrice = parsePrice(
      await this.subtotalProratedPrice.innerText(),
    );
    const expectedProratedSubtotalPrice = calculateExpectedSubtotalPrice(true);

    return proratedSubtotalPrice === expectedProratedSubtotalPrice;
  }

  private async areExpectedAddonNamesPresent(): Promise<boolean> {
    const addonsCount = await this.addonItems.count();
    const addonNames = await this.addonItemNames.allInnerTexts();
    const expectedAddonNames = ADDONS_INFO.map((addon) => addon.name);

    for (let i = 0; i < addonsCount; i++) {
      if (expectedAddonNames[i] !== addonNames[i].trim()) {
        return false;
      }
    }

    return true;
  }

  private async areAddonPricesCorrect() {
    const addonPrices = (await this.addonItemPrices.allInnerTexts()).map(
      (price) => parsePrice(price),
    );
    const expectedAddonPrices = ADDONS_INFO.map((addon) => addon.price);

    for (let i = 0; i < expectedAddonPrices.length; i++) {
      if (expectedAddonPrices[i] !== addonPrices[i]) {
        return false;
      }
    }

    return true;
  }

  private async areProratedAddonPricesCorrect(): Promise<boolean> {
    const proratedAddonPrices = (
      await this.addonProratedItemPrices.allInnerTexts()
    ).map((price) => parsePrice(price));
    const expectedProratedAddonPrices = ADDONS_INFO.map((addon) =>
      calculateProratedPrice(addon.price),
    );

    for (let i = 0; i < expectedProratedAddonPrices.length; i++) {
      if (expectedProratedAddonPrices[i] !== proratedAddonPrices[i]) {
        return false;
      }
    }

    return true;
  }

  async areSubtotalAndAddonPricesCorrect() {
    const isSubtotalPriceCorrect = await this.isSubtotalPriceCorrect();
    const areAddonPricesCorrect = await this.areAddonPricesCorrect();

    return isSubtotalPriceCorrect && areAddonPricesCorrect;
  }

  async areAllProratedPricesCorrect() {
    const isProratedProductPriceCorrect =
      await this.isProratedProductPriceCorrect();
    const areProratedAddonPricesCorrect =
      await this.areProratedAddonPricesCorrect();
    const isProratedSubtotalPriceCorrect =
      await this.isProratedSubtotalPriceCorrect();

    return (
      isProratedProductPriceCorrect &&
      areProratedAddonPricesCorrect &&
      isProratedSubtotalPriceCorrect
    );
  }

  async areExpectedProductAndAddonNamesPresent() {
    const isExpectedProductNamePresent =
      await this.isExpectedProductNamePresent();
    const areExpectedAddonNamesPresent =
      await this.areExpectedAddonNamesPresent();

    return isExpectedProductNamePresent && areExpectedAddonNamesPresent;
  }

  private async isExpectedProductNamePresent(): Promise<boolean> {
    const productName = await getDirectTextOnly(this.productItemName);
    return productName === PRODUCT_INFO.name;
  }

  private async isProratedProductPriceCorrect() {
    const productPrice = await this.productProratedItemPrice.innerText();
    const expectedProductProratedPrice = calculateProratedPrice(
      PRODUCT_INFO.price,
    );

    return parsePrice(productPrice) === expectedProductProratedPrice;
  }

  async waitForReviewHeader() {
    await this.reviewHeader.waitFor({ state: 'visible' });
  }
}
