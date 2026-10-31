export type CheckoutLineInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
  /** Display name from cart; stored on order_items for emails. */
  productName?: string;
  /** Product image from cart at checkout time; stored on order_items for the confirmation email. */
  productImageUrl?: string;
  /** Printify variant id when known (numeric from Printify catalog). */
  printifyVariantId?: number | string;
};

/** Shipping is quoted per country and cart by lib/shipping.ts (server side). */
export function computeCheckoutTotalEur(
  lines: CheckoutLineInput[],
  shippingEur: number,
): { subtotal: number; shipping: number; total: number } {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  return { subtotal, shipping: shippingEur, total: subtotal + shippingEur };
}

/** Stripe amount in smallest currency unit (e.g. cents for EUR). */
export function eurToStripeCents(totalEur: number): number {
  return Math.round(totalEur * 100);
}
