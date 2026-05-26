import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ResetPasswordPageClient } from "@/components/ResetPasswordPageClient";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password for your Trash Tribe account.",
  alternates: { canonical: "/reset-password" },
};

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-0 flex-1 flex-col bg-background">
        <ResetPasswordPageClient />
      </main>
      <Footer />
    </>
  );
}
