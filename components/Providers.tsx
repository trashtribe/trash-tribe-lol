"use client";

import type { ReactNode } from "react";

import type { StoreProduct } from "@/lib/products";

import { CartProvider } from "./CartProvider";
import { CartSidebar } from "./CartSidebar";
import { SearchModal } from "./SearchModal";
import { SearchModalProvider } from "./SearchModalContext";
import { WishlistProvider } from "./WishlistProvider";

export function Providers({
  children,
  products,
}: {
  children: ReactNode;
  products: StoreProduct[];
}) {
  return (
    <CartProvider>
      <WishlistProvider>
        <SearchModalProvider>
          {children}
          <CartSidebar />
          <SearchModal products={products} />
        </SearchModalProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
