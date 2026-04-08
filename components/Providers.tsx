"use client";

import type { ReactNode } from "react";

import { CartProvider } from "./CartProvider";
import { CartSidebar } from "./CartSidebar";
import { SearchModal } from "./SearchModal";
import { SearchModalProvider } from "./SearchModalContext";
import { WishlistProvider } from "./WishlistProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <SearchModalProvider>
          {children}
          <CartSidebar />
          <SearchModal />
        </SearchModalProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
