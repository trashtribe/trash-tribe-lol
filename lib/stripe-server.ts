import Stripe from "stripe";

function requireSecret(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  return key;
}

export function getStripe(): Stripe {
  return new Stripe(requireSecret(), {
    typescript: true,
  });
}
