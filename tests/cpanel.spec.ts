import { expect } from '@playwright/test';
import { test } from '../fixtures/cpanel-pages-fixture';
import { CHECKOUT_SECTIONS } from './data/testData';

test.describe('cPanel Store Product Adding To Cart Flow', () => {
  test('Should allow adding a product and addons to the cart and verify checkout information', async ({ homePage }) => {
    // Step 1: Navigate to the cPanel store
    await homePage.visit();
    expect(
      await homePage.isUserLoggedIn(),
      'User should not be logged in',
    ).toBe(false);
    // Step 2: Order a Product
    const productCategoryPage = await homePage.clickOrderNowButton();

    const configureOrderPage =
      await productCategoryPage.clickOrderProductButton();
    // Step 3: Enter IP Address
    await configureOrderPage.enterIPAddress();
    // Step 4: Select Addons
    await configureOrderPage.selectAddons();
    // Step 5: Continue to Checkout
    expect(
      await configureOrderPage.isOrderSummaryUpdatedWithAddons(),
      'Order summary should update with selected addons',
    ).toBe(true);
    const reviewOrderPage = await configureOrderPage.clickContinueButton();

    // Step 6: Verify Product and Price
    await test.step('Verify product and price', async () => {
      expect(
        await reviewOrderPage.areExpectedProductAndAddonNamesPresent(),
        'Chosen product and addons should be present',
      ).toBe(true);
      expect(
        await reviewOrderPage.areSubtotalAndAddonPricesCorrect(),
        'Subtotal and addon prices should be the same as mentioned before',
      ).toBe(true);
      expect(
        await reviewOrderPage.areAllProratedPricesCorrect(),
        'Prorated prices should be calculated correctly',
      ).toBe(true);
    });
    // Step 7: Proceed to Checkout
    const checkoutOrderPage = await reviewOrderPage.clickCheckoutButton();

    // Step 8: Verify Checkout Information
    await test.step('Verify product table information', async () => {
      expect(
        await checkoutOrderPage.areItemNamesCorrect(),
        'Names of product and addons should be the same as mentioned before',
      ).toBe(true);
      expect(
        await checkoutOrderPage.areIpAddressesCorrect(),
        'IP addresses should correspond to the defined one earlier',
      ).toBe(true);
      expect(
        await checkoutOrderPage.areRecurringPricesCorrect(),
        'Recurring prices should be the same as mentioned before',
      ).toBe(true);
      expect(
        await checkoutOrderPage.areDueTodayPricesCorrect(),
        'Due Today product and addons prices should be calculated properly',
      ).toBe(true);
    });

    for (const sectionName of CHECKOUT_SECTIONS) {
      const section = checkoutOrderPage.getSection(sectionName);
      await expect(section).toBeVisible();
    }

    await test.step('Verify complete order button', async () => {
      await expect(
        checkoutOrderPage.disabledCompleteOrderButton,
        'Complete order button should be visible',
      ).toBeVisible();
      await expect(
        checkoutOrderPage.disabledCompleteOrderButton,
        'Complete order button should be disabled',
      ).toBeDisabled();
    });
  });
});
