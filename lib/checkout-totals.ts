export type CheckoutLineInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
  /** Printify variant id when known (SKU line in Printify). */
  printifyVariantId?: string;
};

export function getShippingEur(
  subtotal: number,
  method: "standard" | "express",
): number {
  if (method === "express") return 12.99;
  return subtotal >= 100 ? 0 : 4.99;
}

export function computeCheckoutTotalEur(
  lines: CheckoutLineInput[],
  shippingMethod: "standard" | "express",
): { subtotal: number; shipping: number; total: number } {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const shipping = getShippingEur(subtotal, shippingMethod);
  return { subtotal, shipping, total: subtotal + shipping };
}

/** Stripe amount in smallest currency unit (e.g. cents for EUR). */
export function eurToStripeCents(totalEur: number): number {
  return Math.round(totalEur * 100);
}
