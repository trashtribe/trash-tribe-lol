import type { Metadata } from "next";
import Link from "next/link";

import { LegalHeading, LegalList, LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL, LEGAL_ENTITY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Delivery times, shipping costs, destinations and how to return an order.",
  alternates: { canonical: "/shipping-returns" },
};

const linkClass = "underline underline-offset-4 hover:tt-text-secondary";

// Kept in sync with lib/checkout-totals.ts (getShippingEur), the
// confirmation email's delivery estimates and COUNTRIES in
// components/CheckoutPageClient.tsx.
const DESTINATIONS =
  "Ireland, the United Kingdom, France, Germany, Spain, Italy, the Netherlands, Belgium, Portugal, Austria, Sweden, Denmark, Finland, Poland, the United States, Canada, Australia and Japan";

export default function ShippingReturnsPage() {
  return (
    <LegalPage title="Shipping & Returns">
      <LegalHeading>Production</LegalHeading>
      <p>
        Every item is printed on demand after you order, which usually takes 2–5 business days.
        Your order then ships, and you&apos;ll find tracking in your account once it&apos;s on its
        way.
      </p>

      <LegalHeading>Shipping costs and times</LegalHeading>
      <LegalList>
        <li>
          <strong>Standard:</strong> €4.99, free on orders of €100 or more. Usually 5–7 business
          days after production.
        </li>
        <li>
          <strong>Express:</strong> €12.99. Usually 2–3 business days after production.
        </li>
      </LegalList>
      <p>
        Times are estimates for Europe; other destinations can take longer, and carriers can be
        delayed at busy times of year.
      </p>

      <LegalHeading>Where we ship</LegalHeading>
      <p>
        We currently ship to {DESTINATIONS}. Orders to countries outside the EU may be charged
        import duties or taxes on arrival, which are paid by the customer.
      </p>

      <LegalHeading>Returns (14-day right of withdrawal)</LegalHeading>
      <p>
        If you live in the EU you can return items within 14 days of receiving them, for any
        reason:
      </p>
      <LegalList>
        <li>
          Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            {CONTACT_EMAIL}
          </a>{" "}
          with your order number and the items you want to return.
        </li>
        <li>
          {LEGAL_ENTITY.returnsAddress
            ? `Send them, unworn and unwashed, to ${LEGAL_ENTITY.returnsAddress}, within 14 days of telling us.`
            : "We'll reply with the return address. Send the items, unworn and unwashed, within 14 days of telling us."}
        </li>
        <li>Return shipping is paid by you. We recommend a tracked service.</li>
        <li>
          Once we receive them, we refund the items and the original standard shipping cost
          within 14 days, to your original payment method.
        </li>
      </LegalList>
      <p>For hygiene reasons, unsealed underwear can only be returned if it&apos;s faulty.</p>

      <LegalHeading>Damaged, misprinted or wrong items</LegalHeading>
      <p>
        Email us within 30 days of delivery with your order number and a photo of the problem.
        We&apos;ll send a replacement or refund you in full — you don&apos;t pay anything, and you
        don&apos;t need to send the item back unless we ask.
      </p>

      <LegalHeading>Lost parcels</LegalHeading>
      <p>
        If your tracking hasn&apos;t moved for 10 business days or the parcel never arrives, contact
        us and we&apos;ll look into it with the carrier and reship or refund.
      </p>

      <p className="mt-6">
        Full details are in our{" "}
        <Link href="/terms" className={linkClass}>
          Terms &amp; Conditions
        </Link>
        .
      </p>
    </LegalPage>
  );
}
