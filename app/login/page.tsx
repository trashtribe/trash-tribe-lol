import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LoginPageClient } from "@/components/LoginPageClient";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your trashtribe account.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialTab = tab === "signup" ? "signup" : "signin";

  return (
    <>
      <Header />
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <LoginPageClient initialTab={initialTab} />
      </main>
      <Footer />
    </>
  );
}
