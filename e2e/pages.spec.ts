import { expect, test } from "@playwright/test";

import { dismissSignupPopup, getCatalog } from "./helpers";

test.beforeEach(async ({ page }) => {
  await dismissSignupPopup(page);
});

test("home page loads", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("link", { name: "trashtribe" }).first()).toBeVisible();
});

test("shop lists products and links to them", async ({ page, request }) => {
  const catalog = await getCatalog(request);
  expect(catalog.length).toBeGreaterThan(0);

  await page.goto("/shop");
  const first = catalog[0];
  await expect(page.locator(`a[href="/shop/${first.slug}"]`).first()).toBeVisible();
});

test("hidden categories stay out of the store", async ({ page, request }) => {
  const catalog = await getCatalog(request);
  expect(catalog.filter((p) => p.category === "UNDERWEAR")).toEqual([]);

  // A hidden category in the URL falls back to the full shop instead of an empty page.
  const res = await page.goto("/shop?category=underwear");
  expect(res?.status()).toBe(200);
  await expect(page.locator(`a[href="/shop/${catalog[0].slug}"]`).first()).toBeVisible();
});

for (const path of ["/privacy", "/terms"]) {
  test(`legal page ${path} shows the seller identity`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.getByText("deeptribe OÜ").first()).toBeVisible();
  });
}

test("shipping and returns page loads", async ({ page }) => {
  const res = await page.goto("/shipping-returns");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("security headers are set", async ({ request }) => {
  const res = await request.get("/");
  const headers = res.headers();
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-powered-by"]).toBeUndefined();
});

test("sitemap and robots are served", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/shop");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap:");
});
