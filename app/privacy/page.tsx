import type { Metadata } from "next";

import { LegalHeading, LegalList, LegalPage, sellerIdentity } from "@/components/LegalPage";
import { CONTACT_EMAIL, LEGAL_ENTITY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How trashtribe handles your personal data.",
  alternates: { canonical: "/privacy" },
};

const linkClass = "underline underline-offset-4 hover:tt-text-secondary";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        trashtribe is run by {sellerIdentity(LEGAL_ENTITY)}. We only collect what we need to run
        the shop, and we never sell your data.
      </p>

      <LegalHeading>What we collect</LegalHeading>
      <LegalList>
        <li>
          <strong>When you order:</strong> your name, email, phone and shipping address, to make
          and deliver your order.
        </li>
        <li>
          <strong>Payments:</strong> handled by our payment provider. We never see your card
          details.
        </li>
        <li>
          <strong>If you create an account:</strong> your email, saved address, wishlist and order
          history.
        </li>
        <li>
          <strong>If you join the newsletter or contact us:</strong> your email and your message.
        </li>
      </LegalList>

      <LegalHeading>Who we share it with</LegalHeading>
      <p>
        Only the services that run the shop for us — payments, printing and delivery, hosting and
        email — and only what each one needs to do its job.
      </p>

      <LegalHeading>Cookies and analytics</LegalHeading>
      <p>
        No advertising or tracking cookies. We count visits with privacy-friendly analytics that
        don&apos;t use cookies or identify you. Your browser stores your cart, wishlist and login
        so the shop works.
      </p>

      <LegalHeading>How long we keep it</LegalHeading>
      <p>
        Order records as long as tax law requires; everything else until you ask us to delete it
        or unsubscribe.
      </p>

      <LegalHeading>Your rights</LegalHeading>
      <p>
        You can ask to see, correct, export or delete your data, or unsubscribe at any time, by
        emailing{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
          {CONTACT_EMAIL}
        </a>
        . You can also complain to your local data protection authority.
      </p>
    </LegalPage>
  );
}
