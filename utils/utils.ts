import { Locator } from '@playwright/test';
import { PRODUCT_INFO, ADDONS_INFO } from '../tests/data/testData';

/**
 * Gets only the direct text content of an element, excluding text from child elements
 * @param locator - Playwright locator for the element
 * @returns Promise<string> - Direct text content only
 */
export async function getDirectTextOnly(locator: Locator): Promise<string> {
  const directText = await locator.evaluate((element) => {
    // Get only direct text nodes, excluding child elements
    const textNodes: string[] = [];
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        textNodes.push(node.textContent);
      }
    }
    return textNodes.join('').trim();
  });

  return directText;
}

export function calculateExpectedSubtotalPrice(isProrated: boolean): number {
  let productPrice: number;
  let addonsPrice: number;

  if (isProrated) {
    productPrice = calculateProratedPrice(PRODUCT_INFO.price);
    addonsPrice = ADDONS_INFO.map((addon) =>
      calculateProratedPrice(addon.price),
    ).reduce((acc, val) => acc + val, 0);
  } else {
    productPrice = PRODUCT_INFO.price;
    addonsPrice = ADDONS_INFO.map((addon) => addon.price).reduce(
      (acc, val) => acc + val,
      0,
    );
  }

  return productPrice + addonsPrice;
}

/**
 * Parses a price string and returns the numeric value.
 * @param priceString The price string to parse.
 * @returns The parsed price as a number, or NaN if parsing fails.
 */
export function parsePrice(priceString: string): number {
  if (!priceString) {
    return NaN;
  }

  const match = priceString.replace(',', '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : NaN;
}

/**
 * Calculates prorated price for the current day of the month.
 * - If today is the 1st, returns the full price.
 * - If today is the last day, returns price for one day.
 * - Otherwise, subtracts the price for each day that has passed.
 * @param price The full monthly price (number or string).
 * @param date Optional: Date to use (defaults to today).
 * @returns The prorated price rounded to 2 decimals.
 */
export function calculateProratedPrice(
  price: number | string,
  date: Date = new Date(),
): number {
  const monthlyPrice = typeof price === 'string' ? parseFloat(price) : price;
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  if (day === 1) {
    return Number(monthlyPrice.toFixed(2));
  }

  const dailyPrice = monthlyPrice / daysInMonth;
  const daysLeft = daysInMonth - day + 1;
  const prorated = dailyPrice * daysLeft;

  return Number(prorated.toFixed(2));
}
