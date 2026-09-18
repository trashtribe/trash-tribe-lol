import type { Metadata } from "next";
import Image from "next/image";

import { NewsletterForm } from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Coming soon",
  description: "trashtribe is launching soon.",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <Image
        src="/tt.png"
        alt="trashtribe"
        width={220}
        height={259}
        priority
        style={{ width: "220px", height: "auto" }}
        className="max-w-[60vw] object-contain sm:max-w-none"
      />
      <h1 className="mt-8 text-3xl font-bold tracking-[0.2em] tt-text-on-light uppercase sm:text-4xl">
        Coming soon
      </h1>
      <div className="mt-8 w-full max-w-sm">
        <NewsletterForm />
      </div>
    </main>
  );
}
