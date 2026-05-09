import { CheckoutPageClient } from "@/components/CheckoutPageClient";
import { CheckoutStripeProvider } from "@/components/CheckoutStripeProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <CheckoutStripeProvider>
          <CheckoutPageClient />
        </CheckoutStripeProvider>
      </main>
      <Footer />
    </>
  );
}
