import type { CartItem } from "@/components/CartProvider";

export type StoredOrderLine = {
  key: string;
  name: string;
  imageSrc: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  size?: string;
};

export type StoredCompletedOrder = {
  lines: StoredOrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingMethod: "standard" | "express";
  email: string;
  placedAt: string;
};

const STORAGE_KEY = "tt_order_confirmation_v1";

export function saveCompletedOrder(order: StoredCompletedOrder) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

export function loadCompletedOrder(): StoredCompletedOrder | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredCompletedOrder;
    if (!parsed || !Array.isArray(parsed.lines)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearCompletedOrder() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function cartItemsToStoredLines(items: CartItem[]): StoredOrderLine[] {
  return items.map((item) => ({
    key: item.key,
    name: item.name,
    imageSrc: item.imageSrc,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.quantity,
    size: item.size,
  }));
}
