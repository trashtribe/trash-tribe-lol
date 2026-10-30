import { expect, test } from "@playwright/test";

import { getBuyableProduct, validShipping } from "./helpers";

// Every request here is rejected before anything is written to Supabase or
// sent to Stripe, so these are safe to run against any environment.

test.describe("create-payment-intent", () => {
  test("rejects a total that doesn't match catalog prices", async ({ request }) => {
    const { product, variant } = await getBuyableProduct(request);
    const res = await request.post("/api/create-payment-intent", {
      data: {
        ...validShipping,
        amount: 50,
        items: [
          {
            productId: product.id,
            printifyVariantId: variant.id,
            quantity: 1,
            unitPrice: 0.01,
          },
        ],
      },
    });
    expect(res.status()).toBe(409);
  });

  test("rejects products that don't exist", async ({ request }) => {
    const res = await request.post("/api/create-payment-intent", {
      data: {
        ...validShipping,
        amount: 2000,
        items: [{ productId: "not-a-real-product", quantity: 1, unitPrice: 15 }],
      },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain("unavailable");
  });

  test("rejects absurd or fractional quantities", async ({ request }) => {
    const { product, variant } = await getBuyableProduct(request);
    for (const quantity of [51, 1.5, 0]) {
      const res = await request.post("/api/create-payment-intent", {
        data: {
          ...validShipping,
          amount: 5000,
          items: [
            { productId: product.id, printifyVariantId: variant.id, quantity, unitPrice: 20 },
          ],
        },
      });
      expect(res.status(), `quantity ${quantity}`).toBe(400);
    }
  });

  test("requires a valid guest email", async ({ request }) => {
    const { product, variant } = await getBuyableProduct(request);
    const res = await request.post("/api/create-payment-intent", {
      data: {
        ...validShipping,
        guestEmail: "not-an-email",
        amount: 2000,
        items: [{ productId: product.id, printifyVariantId: variant.id, quantity: 1, unitPrice: 20 }],
      },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("forms", () => {
  test("newsletter quietly accepts bots that fill the honeypot", async ({ request }) => {
    const res = await request.post("/api/newsletter", {
      data: { email: "bot@example.com", website: "http://spam.example" },
    });
    expect(res.status()).toBe(200);
  });

  test("newsletter rejects an invalid email", async ({ request }) => {
    const res = await request.post("/api/newsletter", { data: { email: "<script>" } });
    expect(res.status()).toBe(400);
  });

  test("contact quietly accepts bots that fill the honeypot", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: {
        name: "Bot",
        email: "bot@example.com",
        subject: "Hi",
        message: "Spam",
        website: "http://spam.example",
      },
    });
    expect(res.status()).toBe(200);
  });

  test("contact rejects missing fields and oversized messages", async ({ request }) => {
    const missing = await request.post("/api/contact", { data: { name: "A" } });
    expect(missing.status()).toBe(400);

    const huge = await request.post("/api/contact", {
      data: { name: "A", email: "a@example.com", subject: "Hi", message: "x".repeat(5001) },
    });
    expect(huge.status()).toBe(400);
  });
});
