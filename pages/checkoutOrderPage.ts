import { Locator, Page } from '@playwright/test';
import { ADDONS_INFO, IP_ADDRESS, PRODUCT_INFO } from '../tests/data/testData';
import {
  calculateExpectedSubtotalPrice,
  calculateProratedPrice,
  parsePrice,
} from '../utils/utils';

export default class CheckoutOrderPage {
  readonly page: Page;
  private readonly checkoutHeader: Locator;
  private readonly orderSummaryTableHeaders: Locator;
  private readonly orderSummaryTable: Locator;
  private readonly subTotalPrice: Locator;
  readonly disabledCompleteOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutHeader = page.locator('h1');
    this.orderSummaryTable = page.locator('table');
    this.orderSummaryTableHeaders = this.orderSummaryTable.locator('th');
    this.subTotalPrice = this.orderSummaryTable.locator(
      '.card-body:has-text("Sub Total")',
    );
    this.disabledCompleteOrderButton = page.locator('#btnCompleteOrder');
  }

  getSection(sectionName: string) {
    return this.page.locator(`.sub-heading:has-text("${sectionName}")`);
  }

  async waitForCheckoutHeader() {
    await this.checkoutHeader.waitFor({ state: 'visible' });
  }

  async isSubtotalPriceCorrect() {
    const actualSubtotalPrice = parsePrice(
      await this.subTotalPrice.innerText(),
    );
    const expectedSubtotalPrice = calculateExpectedSubtotalPrice(true);

    return actualSubtotalPrice === expectedSubtotalPrice;
  }

  private getColumnCells(columnIndex: number) {
    return this.orderSummaryTable.locator(`tbody td:nth-child(${columnIndex})`);
  }

  private async getItemNames(): Promise<string[]> {
    const columnIndex = await this.getColumnIndex('Product Type');
    const itemNameCells = this.getColumnCells(columnIndex);
    const cellTexts = await itemNameCells.allInnerTexts();

    return cellTexts.map((text) => text.trim());
  }

  private async getColumnIndex(columnName: string): Promise<number> {
    const tableHeaders = await this.orderSummaryTableHeaders.allInnerTexts();
    const tableHeaderIndex = tableHeaders.findIndex(
      (header) => header.trim() === columnName,
    );

    if (tableHeaderIndex === -1) {
      throw new Error(`Column "${columnName}" not found`);
    }

    return tableHeaderIndex + 1; // CSS nth-child is 1-indexed
  }

  private async getIpAddresses() {
    const columnIndex = await this.getColumnIndex('IP Address');
    const ipAddressCells = this.getColumnCells(columnIndex);
    const cellTexts = await ipAddressCells.allInnerTexts();

    return cellTexts.map((text) => text.trim());
  }

  private async getRecurringPrices() {
    const columnIndex = await this.getColumnIndex('Recurring Price');
    const recurringPriceCells = this.getColumnCells(columnIndex);
    const cellTexts = await recurringPriceCells.allInnerTexts();

    return cellTexts.map((text) => parsePrice(text));
  }

  private async getDueTodayPrices() {
    const columnIndex = await this.getColumnIndex('Due Today');
    const dueTodayPriceCells = this.getColumnCells(columnIndex);
    const cellTexts = await dueTodayPriceCells.allInnerTexts();

    return cellTexts.map((text) => parsePrice(text));
  }

  async areDueTodayPricesCorrect() {
    const actualDueTodayPrices = await this.getDueTodayPrices();
    const proratedExpectedProductPrice = calculateProratedPrice(
      PRODUCT_INFO.price,
    );
    const proratedExpectedAddonPrices = ADDONS_INFO.map((addon) =>
      calculateProratedPrice(addon.price),
    );

    const expectedDueTodayPrices = [
      proratedExpectedProductPrice,
      ...proratedExpectedAddonPrices,
    ];

    for (let i = 0; i < actualDueTodayPrices.length; i++) {
      if (actualDueTodayPrices[i] !== expectedDueTodayPrices[i]) {
        return false;
      }
    }

    return true;
  }

  async areRecurringPricesCorrect() {
    const actualRecurringPrices = await this.getRecurringPrices();
    const expectedSubTotalPrice = calculateExpectedSubtotalPrice(false);
    const expectedAddonPrices = ADDONS_INFO.map((addon) => addon.price);

    const expectedRecurringPrices = [
      expectedSubTotalPrice,
      ...expectedAddonPrices,
    ];

    for (let i = 0; i < actualRecurringPrices.length; i++) {
      if (actualRecurringPrices[i] !== expectedRecurringPrices[i]) {
        return false;
      }
    }

    return true;
  }

  async areIpAddressesCorrect() {
    const actualIpAddresses = await this.getIpAddresses();
    const expectedIpAddress = IP_ADDRESS;

    for (let i = 0; i < actualIpAddresses.length; i++) {
      if (actualIpAddresses[i] !== expectedIpAddress) {
        return false;
      }
    }

    return true;
  }

  async areItemNamesCorrect() {
    const actualItemNames = await this.getItemNames();
    const expectedAddonNames = ADDONS_INFO.map((addon) => addon.name);

    const expectedItemNames = [PRODUCT_INFO.name, ...expectedAddonNames];

    for (let i = 0; i < expectedItemNames.length; i++) {
      if (actualItemNames[i] !== expectedItemNames[i]) {
        return false;
      }
    }

    return true;
  }
}
