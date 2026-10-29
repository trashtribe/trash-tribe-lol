import type { Metadata } from "next";
import Link from "next/link";

import { LegalHeading, LegalList, LegalPage, sellerIdentity } from "@/components/LegalPage";
import { CONTACT_EMAIL, LEGAL_ENTITY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply when you buy from trashtribe.",
  alternates: { canonical: "/terms" },
};

const linkClass = "underline underline-offset-4 hover:tt-text-secondary";

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <p>
        trashtribe is a brand of {sellerIdentity(LEGAL_ENTITY)}. By ordering you accept these
        terms. They never limit your rights as a consumer under EU law.
      </p>

      <LegalHeading>Products</LegalHeading>
      <p>
        Everything is printed on demand, just for you. Colours can look slightly different on
        screen, and small variations in print placement are normal.
      </p>

      <LegalHeading>Prices and payment</LegalHeading>
      <LegalList>
        <li>Prices are in euros. Shipping is shown at checkout before you pay.</li>
        <li>Orders outside the EU may be charged import duties by the destination country.</li>
        <li>
          Your order is confirmed once payment succeeds and you get our confirmation email.
        </li>
      </LegalList>

      <LegalHeading>Changes and cancellations</LegalHeading>
      <p>
        Production starts quickly, so contact us right away if you need to change or cancel an
        order. Once it&apos;s made, you can still return it as described below.
      </p>

      <LegalHeading>Returns and faulty items</LegalHeading>
      <p>
        You have 14 days from delivery to return items, and faulty or wrong items are always
        replaced or refunded. See{" "}
        <Link href="/shipping-returns" className={linkClass}>
          Shipping &amp; Returns
        </Link>{" "}
        for how.
      </p>

      <LegalHeading>Our designs</LegalHeading>
      <p>All designs and content on this site belong to trashtribe and can&apos;t be reused.</p>

      <LegalHeading>Law</LegalHeading>
      <p>
        These terms are governed by the law of {LEGAL_ENTITY.country || "the EU"}. As a consumer, you also keep the protection of the laws where you live. Questions?{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </LegalPage>
  );
}
