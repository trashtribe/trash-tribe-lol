import type { Metadata } from "next";

import { LegalHeading, LegalList, LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, DISCORD_INVITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Delivery times and how to return an order.",
  alternates: { canonical: "/shipping-returns" },
};

const linkClass = "underline underline-offset-4 hover:tt-text-secondary";

// Kept in sync with the confirmation email's delivery estimates and
// SHIPPING_COUNTRIES in lib/countries.ts.
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
        <li>Delivery takes about 5–7 business days after production.</li>
        <li>Shipping depends on where you are and what you order. You&apos;ll see the cost at checkout, before you pay.</li>
        <li>We ship to {DESTINATIONS}. Orders outside the EU may be charged import duties.</li>
      </LegalList>

      <LegalHeading>Returns</LegalHeading>
      <p>
        Changed your mind or something&apos;s not right? You have 14 days from delivery. Just{" "}
        <ContactSupport /> with your order number and we&apos;ll work it out together.
      </p>
    </LegalPage>
  );
}
