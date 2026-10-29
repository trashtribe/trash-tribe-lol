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
        These terms apply to every order placed on trashtribe.lol. By placing an order you accept
        them, so please read them first. Nothing here limits the rights you have as a consumer under
        EU law or the law of the country where you live.
      </p>

      <LegalHeading>Who we are</LegalHeading>
      <p>
        trashtribe is a brand of {sellerIdentity(LEGAL_ENTITY)}. You can reach us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <LegalHeading>Our products</LegalHeading>
      <p>
        Everything we sell is print on demand: each item is made for you after you order it, by our
        production partner Printify. We show product photos and mockups as accurately as we can,
        but colours can look slightly different on screen than in real life, and small variations
        in print placement are normal.
      </p>

      <LegalHeading>Prices and payment</LegalHeading>
      <LegalList>
        <li>
          Prices are in euros (EUR) and are the final price of the product. Shipping is added at
          checkout, and you see the full total before you pay.
        </li>
        <li>
          Orders shipped outside the EU may be charged import duties or taxes by the destination
          country. These are set by that country and paid by the customer.
        </li>
        <li>Payment is taken by card through Stripe when you place the order.</li>
      </LegalList>

      <LegalHeading>Your order</LegalHeading>
      <p>
        Your contract with us is formed when your payment succeeds and we email you an order
        confirmation. Because production starts quickly, we can only cancel or change an order if
        you contact us before it goes into production — email us as soon as possible. Once it has
        been made, you can still use your right of withdrawal described below.
      </p>
      <p>
        If an item becomes unavailable after you order it, we&apos;ll tell you and refund you in
        full.
      </p>

      <LegalHeading>Delivery</LegalHeading>
      <p>
        Delivery times, costs and destinations are listed on our{" "}
        <Link href="/shipping-returns" className={linkClass}>
          Shipping &amp; Returns
        </Link>{" "}
        page. Responsibility for the parcel passes to you when it is delivered to you.
      </p>

      <LegalHeading>Right of withdrawal (14 days)</LegalHeading>
      <p>
        If you live in the EU you can withdraw from your purchase within 14 days of receiving it,
        without giving a reason. To do so, email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
          {CONTACT_EMAIL}
        </a>{" "}
        with your order number and a clear statement that you want to withdraw, then send the items
        back within 14 days of telling us.
      </p>
      <LegalList>
        <li>You pay the cost of sending the items back.</li>
        <li>
          We refund the price of the items and the original standard shipping cost within 14 days
          of receiving the return (or proof that you sent it), using your original payment method.
        </li>
        <li>
          Items should be returned unworn, unwashed and in their original condition. We may reduce
          the refund if the items have been handled more than needed to check them.
        </li>
        <li>
          For hygiene reasons, underwear can&apos;t be returned once it has been unsealed, unless
          it is faulty.
        </li>
      </LegalList>

      <LegalHeading>Faulty or wrong items</LegalHeading>
      <p>
        If something arrives damaged, misprinted or isn&apos;t what you ordered, email us with your
        order number and a photo within 30 days of delivery and we&apos;ll replace it or refund
        you, at no cost to you. This doesn&apos;t affect your legal guarantee: under EU law, goods
        must match their description and be free of defects for two years after delivery.
      </p>

      <LegalHeading>Accounts</LegalHeading>
      <p>
        You don&apos;t need an account to buy. If you create one, keep your password private;
        you&apos;re responsible for activity on your account. We may suspend accounts used for
        fraud or abuse.
      </p>

      <LegalHeading>Intellectual property</LegalHeading>
      <p>
        All designs, graphics and text on this site belong to trashtribe or its licensors. You
        can&apos;t copy, resell or reproduce them without our written permission.
      </p>

      <LegalHeading>Liability</LegalHeading>
      <p>
        We&apos;re responsible for losses that are a foreseeable result of us breaking these terms.
        We don&apos;t exclude or limit liability where the law doesn&apos;t allow it, including for
        death or personal injury caused by negligence, or for fraud.
      </p>

      <LegalHeading>Governing law</LegalHeading>
      <p>
        These terms are governed by the law of{" "}
        {LEGAL_ENTITY.country || "the EU member state where trashtribe is established"}. If you
        are a consumer, you also keep the protection of the mandatory laws of
        the country where you live, and you can bring a claim in the courts there.
      </p>

      <LegalHeading>Changes</LegalHeading>
      <p>
        We may update these terms. The version that applies to your order is the one published
        when you placed it. Your personal data is handled as described in our{" "}
        <Link href="/privacy" className={linkClass}>
          Privacy Policy
        </Link>
        .
      </p>
    </LegalPage>
  );
}
