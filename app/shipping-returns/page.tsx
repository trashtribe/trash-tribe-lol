import type { Metadata } from "next";

import { LegalHeading, LegalList, LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, DISCORD_INVITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Delivery times, shipping costs and how to return an order.",
  alternates: { canonical: "/shipping-returns" },
};

const linkClass = "underline underline-offset-4 hover:tt-text-secondary";

// Kept in sync with lib/checkout-totals.ts (getShippingEur), the
// confirmation email's delivery estimates and COUNTRIES in
// components/CheckoutPageClient.tsx.
const DESTINATIONS =
  "Ireland, the UK, France, Germany, Spain, Italy, the Netherlands, Belgium, Portugal, Austria, Sweden, Denmark, Finland, Poland, the US, Canada, Australia and Japan";

function ContactSupport() {
  return (
    <>
      email{" "}
      <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
        {CONTACT_EMAIL}
      </a>{" "}
      or message us on{" "}
      <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
        Discord
      </a>
    </>
  );
}

export default function ShippingReturnsPage() {
  return (
    <LegalPage title="Shipping & Returns">
      <LegalHeading>Shipping</LegalHeading>
      <LegalList>
        <li>Every item is printed on demand, usually within 2–5 business days.</li>
        <li>
          <strong>Standard:</strong> €4.99, free from €100 — about 5–7 business days after
          production.
        </li>
        <li>
          <strong>Express:</strong> €12.99 — about 2–3 business days after production.
        </li>
        <li>We ship to {DESTINATIONS}. Orders outside the EU may be charged import duties.</li>
      </LegalList>

      <LegalHeading>Returns</LegalHeading>
      <p>
        Changed your mind? You have 14 days from delivery. Just <ContactSupport /> with your order
        number and we&apos;ll walk you through it. Items should be unworn and unwashed, and return
        postage is on you. We refund within 14 days of getting them back.
      </p>

      <LegalHeading>Something wrong with your order?</LegalHeading>
      <p>
        Damaged, misprinted or not what you ordered — <ContactSupport /> with a photo within 30 days
        and we&apos;ll replace it or refund you, free. Same if your parcel never shows up.
      </p>
    </LegalPage>
  );
}
