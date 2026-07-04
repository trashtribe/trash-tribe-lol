"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { StoreProduct } from "@/lib/products";

const CART_STORAGE_KEY = "tt-cart-v1";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  imageSrc: string;
  price: string;
  unitPrice: number;
  quantity: number;
  size?: string;
  variantId?: number;
};

type AddToCartInput = {
  product: StoreProduct;
  quantity?: number;
  size?: string;
  variantId?: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (input: AddToCartInput) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function parseEuroPrice(price: string) {
  const normalized = price.replace(/[^0-9.,]/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

function buildKey(productId: string, variantId?: number, fallbackLabel?: string) {
  if (variantId !== undefined && Number.isFinite(variantId)) {
    return `${productId}::v${variantId}`;
  }
  return `${productId}::${fallbackLabel ?? "default"}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const hydratedRef = useRef(false);

  // Load any cart saved from a previous visit. Runs once after mount (client
  // only), so the server-rendered empty cart never mismatches during hydration.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          queueMicrotask(() => setItems(parsed as CartItem[]));
        }
      }
    } catch {
      // Corrupt or inaccessible storage (e.g. private browsing) — start empty.
    } finally {
      queueMicrotask(() => {
        hydratedRef.current = true;
      });
    }
  }, []);

  // Persist on every change, but only once the load above has run — otherwise
  // this fires first (with the initial empty array) and wipes a saved cart.
  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Quota exceeded or storage disabled — non-fatal, cart still works in-memory.
    }
  }, [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addToCart = useCallback(({ product, quantity = 1, size, variantId }: AddToCartInput) => {
    const safeQuantity = Math.max(1, quantity);
    const key = buildKey(product.id, variantId, size ?? "nosize");

    setItems((prev) => {
      const existing = prev.find((item) => item.key == key);
      if (existing) {
        return prev.map((item) =>
          item.key == key
            ? {
                ...item,
                quantity: item.quantity + safeQuantity,
                variantId: variantId ?? item.variantId,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          key,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          imageSrc: product.imageSrc,
          price: product.price,
          unitPrice: parseEuroPrice(product.price),
          quantity: safeQuantity,
          size,
          variantId,
        },
      ];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    const safeQuantity = Math.max(1, quantity);
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: safeQuantity } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

    return {
      items,
      isOpen,
      itemCount,
      subtotal,
      openCart,
      closeCart,
      addToCart,
      removeItem,
      updateQuantity,
      clearCart,
    };
  }, [
    items,
    isOpen,
    openCart,
    closeCart,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
