import type { Metadata } from "next";

import { AccountPageClient } from "@/components/AccountPageClient";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Sign in or create a Trash Tribe account. Manage your profile and view order history.",
  alternates: { canonical: "/account" },
};

export default function AccountPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <AccountPageClient />
      </main>
      <Footer />
    </>
  );
}
