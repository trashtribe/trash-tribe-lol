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
    <main className="flex min-h-screen flex-col items-center justify-center tt-bg-dark px-4 py-16 text-center">
      <Image
        src="/tt.png"
        alt="trashtribe"
        width={96}
        height={113}
        priority
        style={{ width: "96px", height: "auto" }}
        className="object-contain"
      />
      <h1 className="mt-8 text-3xl font-bold tracking-[0.2em] tt-text-on-dark uppercase sm:text-4xl">
        Coming soon
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed tracking-[0.04em] tt-text-on-dark">
        We&apos;re putting the finishing touches on trashtribe. Leave your email and we&apos;ll
        let you know the moment we launch.
      </p>
      <div className="mt-8 w-full max-w-sm">
        <NewsletterForm />
      </div>
    </main>
  );
}
