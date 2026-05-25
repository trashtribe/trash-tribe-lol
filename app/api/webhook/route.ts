import { NextResponse } from "next/server";

import { submitPaidOrderToPrintify } from "@/lib/printify-order-fulfillment";
import { getStripe } from "@/lib/stripe-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

async function notifyOrderConfirmationEmail(orderId: string): Promise<void> {
  const secret =
    process.env.INTERNAL_ORDER_EMAIL_SECRET?.trim() ??
    process.env.INTERNAL_API_SECRET?.trim();

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    `http://127.0.0.1:${process.env.PORT ?? "3000"}`;

  if (!secret) {
    console.warn(
      "[stripe webhook] INTERNAL_ORDER_EMAIL_SECRET (or INTERNAL_API_SECRET) not set; skipping confirmation email.",
    );
    return;
  }

  try {
    const res = await fetch(`${origin}/api/send-order-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) {
      const details = await res.text().catch(() => "");
      console.error(
        "[stripe webhook] send-order-confirmation:",
        res.status,
        details,
      );
    }
  } catch (e) {
    console.error("[stripe webhook] send-order-confirmation fetch error:", e);
  }
}

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
    const admin = createSupabaseAdminClient();

    let orderId: string =
      typeof pi.metadata?.order_id === "string" ? pi.metadata.order_id.trim() : "";

    if (!orderId && pi.id) {
      const { data: row, error: findErr } = await admin
        .from("orders")
        .select("id")
        .eq("stripe_payment_intent_id", pi.id)
        .maybeSingle();

      if (findErr) {
        console.error("[stripe webhook] order lookup failed:", findErr);
      }
      orderId =
        typeof row?.id === "string" ? row.id : "";
    }

    if (orderId) {
      try {
        const { error } = await admin
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId);

        if (error) {
          console.error("[stripe webhook] order update failed:", error);
        } else {
          await submitPaidOrderToPrintify(admin, orderId);
          await notifyOrderConfirmationEmail(orderId);
        }
      } catch (e) {
        console.error("[stripe webhook] Supabase admin / Printify error:", e);
      }
    } else {
      console.warn(
        "[stripe webhook] payment_intent.succeeded: could not resolve order (metadata.order_id missing and no row for stripe_payment_intent_id:",
        pi.id,
        ")",
      );
    }
  }

  return NextResponse.json({ received: true });
}
