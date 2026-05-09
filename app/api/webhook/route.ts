import { NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set.");
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 500 },
    );
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: import("stripe").Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as import("stripe").Stripe.PaymentIntent;
    const orderId = pi.metadata?.order_id;

    if (orderId) {
      try {
        const admin = createSupabaseAdminClient();
        const { error } = await admin
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId);

        if (error) {
          console.error("[stripe webhook] order update failed:", error);
        }
      } catch (e) {
        console.error("[stripe webhook] Supabase admin error:", e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
