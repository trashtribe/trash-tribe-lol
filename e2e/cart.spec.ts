import { expect, test } from "@playwright/test";

import { dismissSignupPopup, getBuyableProduct } from "./helpers";

test("add to cart, survive a reload, reach checkout", async ({ page, request }) => {
  await dismissSignupPopup(page);
  const { product } = await getBuyableProduct(request);

  await page.goto(`/shop/${product.slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(product.name, {
    ignoreCase: true,
  });

  const addToCart = page.getByRole("button", { name: "Add to cart" });
  // Products with several sizes may need one picked before the button enables.
  if (await addToCart.isDisabled()) {
    await page.locator("button[aria-pressed]:not([disabled])").first().click();
  }
  await expect(addToCart).toBeEnabled();
  await addToCart.click();

  const cartButton = page.getByRole("button", { name: /Shopping cart, 1 items?/ });
  await expect(cartButton).toBeVisible();

  // The cart lives in localStorage, so a reload keeps it.
  await page.reload();
  await expect(cartButton).toBeVisible();

  await cartButton.click();
  const cart = page.getByRole("complementary", { name: "Shopping cart" });
  await expect(cart.getByText(product.name, { exact: false }).first()).toBeVisible();
  await cart.getByRole("link", { name: "Checkout" }).click();

  await expect(page).toHaveURL(/\/checkout/);
  // The summary is rendered twice (mobile and desktop layouts); one is visible.
  await expect(
    page.getByRole("heading", { name: "Order summary" }).filter({ visible: true }),
  ).toBeVisible();
  await expect(
    page.getByText(product.name, { exact: false }).filter({ visible: true }).first(),
  ).toBeVisible();
});
