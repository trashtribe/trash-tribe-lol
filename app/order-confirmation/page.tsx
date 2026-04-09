import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { OrderConfirmationPageClient } from "@/components/OrderConfirmationPageClient";

export default function OrderConfirmationPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <OrderConfirmationPageClient />
      </main>
      <Footer />
    </>
  );
}
