import type { Metadata } from "next";
import Link from "next/link";

import { LegalHeading, LegalList, LegalPage, sellerIdentity } from "@/components/LegalPage";
import { CONTACT_EMAIL, LEGAL_ENTITY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How trashtribe collects, uses and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

const linkClass = "underline underline-offset-4 hover:tt-text-secondary";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what personal data trashtribe collects when you use trashtribe.lol,
        why, who we share it with, and the rights you have under the EU General Data Protection
        Regulation (GDPR).
      </p>

      <LegalHeading>Who is responsible for your data</LegalHeading>
      <p>
        The data controller is {sellerIdentity(LEGAL_ENTITY)}, which runs the trashtribe brand. For anything related to your data,
        email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <LegalHeading>What we collect and why</LegalHeading>
      <LegalList>
        <li>
          <strong>Orders:</strong> your name, email, phone number, shipping address, the items you
          bought and the order total. We need these to make and deliver your order and to keep the
          records tax law requires (legal basis: performance of a contract and legal obligation).
        </li>
        <li>
          <strong>Payments:</strong> handled entirely by Stripe. We never see or store your card
          number; we only receive confirmation that the payment succeeded.
        </li>
        <li>
          <strong>Account (optional):</strong> your email and a password, which is stored hashed by
          our authentication provider and never visible to us. Your account also keeps your saved
          shipping address, wishlist and order history (legal basis: contract).
        </li>
        <li>
          <strong>Newsletter (optional):</strong> your email, only if you sign up. We use it to tell
          you about new drops (legal basis: your consent, which you can withdraw at any time).
        </li>
        <li>
          <strong>Contact form:</strong> your name, email and message, so we can answer you
          (legal basis: legitimate interest in responding to your request).
        </li>
        <li>
          <strong>Spam protection:</strong> when you submit the contact or newsletter form we store
          a one-way scrambled (hashed) version of your IP address for up to 24 hours to limit
          automated abuse. We never store your IP address itself (legal basis: legitimate interest
          in keeping the site secure).
        </li>
      </LegalList>

      <LegalHeading>Who we share it with</LegalHeading>
      <p>
        We only share data with the services needed to run the shop, each bound by a data
        processing agreement:
      </p>
      <LegalList>
        <li>
          <strong>Printify</strong> — prints and ships your order; receives your name, shipping
          address, phone number and the items ordered.
        </li>
        <li>
          <strong>Stripe</strong> — processes your payment.
        </li>
        <li>
          <strong>Supabase</strong> — hosts our database and user accounts.
        </li>
        <li>
          <strong>Resend</strong> — sends order confirmation and account emails.
        </li>
        <li>
          <strong>Vercel</strong> — hosts the website.
        </li>
      </LegalList>
      <p>
        Some of these providers are based in, or use infrastructure in, the United States. Those
        transfers are covered by the EU–US Data Privacy Framework or the European Commission&apos;s
        Standard Contractual Clauses. We never sell your data or share it for advertising.
      </p>

      <LegalHeading>How long we keep it</LegalHeading>
      <LegalList>
        <li>Order records: for as long as tax and accounting law requires.</li>
        <li>Account data: until you ask us to delete your account.</li>
        <li>Newsletter email: until you unsubscribe.</li>
        <li>Contact messages: as long as needed to deal with your request.</li>
        <li>Hashed IP addresses for spam protection: 24 hours.</li>
      </LegalList>

      <LegalHeading>Cookies and local storage</LegalHeading>
      <p>
        We don&apos;t use analytics, advertising or tracking cookies. Your browser&apos;s local
        storage keeps only what the shop needs to work: your cart, your wishlist, whether you closed
        the sign-up pop-up, and your login session if you sign in. Because these are strictly
        necessary, they don&apos;t require consent. Stripe may set its own cookies on the checkout
        page to prevent fraud.
      </p>

      <LegalHeading>Your rights</LegalHeading>
      <p>
        You can ask us to access, correct, delete or export your data, to restrict or object to how
        we use it, and you can withdraw consent (for example, to the newsletter) at any time. Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
          {CONTACT_EMAIL}
        </a>{" "}
        and we&apos;ll reply within one month. You also have the right to complain to the data
        protection authority in the EU country where you live or work, or to our lead authority,
        the Estonian Data Protection Inspectorate (Andmekaitse Inspektsioon).
      </p>

      <LegalHeading>Changes</LegalHeading>
      <p>
        If we change this policy we&apos;ll update the date at the top of this page. See also our{" "}
        <Link href="/terms" className={linkClass}>
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link href="/shipping-returns" className={linkClass}>
          Shipping &amp; Returns
        </Link>
        .
      </p>
    </LegalPage>
  );
}
