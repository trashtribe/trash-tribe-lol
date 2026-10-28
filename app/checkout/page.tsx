import type { Metadata } from "next";

import { CheckoutPageWithStripe } from "@/components/CheckoutPageWithStripe";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <CheckoutPageWithStripe />
      </main>
      <Footer />
    </>
  );
}
