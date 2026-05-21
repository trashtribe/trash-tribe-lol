import { NextResponse } from "next/server";

import {
  computeCheckoutTotalEur,
  eurToStripeCents,
  type CheckoutLineInput,
} from "@/lib/checkout-totals";
import { getStripe } from "@/lib/stripe-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseUserClient } from "@/lib/supabase-route";

type Body = {
  amount?: number;
  currency?: string;
  accessToken?: string;
  /** Required for guest checkout (no accessToken). */
  guestEmail?: string;
  items?: CheckoutLineInput[];
  shippingMethod?: "standard" | "express";
  shippingName?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  shippingPhone?: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const {
      amount,
      currency = "eur",
      accessToken,
      guestEmail,
      items,
      shippingMethod = "standard",
      shippingName,
      shippingAddress1,
      shippingAddress2,
      shippingCity,
      shippingPostalCode,
      shippingCountry,
      shippingPhone,
    } = body;

    const tokenTrimmed =
      typeof accessToken === "string" && accessToken.trim() ? accessToken.trim() : "";

    if (
      typeof amount !== "number" ||
      amount < 50 ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid request: amount and items are required.",
        },
        { status: 400 },
      );
    }

    if (!tokenTrimmed) {
      const rawGuest =
        typeof guestEmail === "string" ? guestEmail.trim() : "";
      if (!isValidEmail(rawGuest)) {
        return NextResponse.json(
          {
            error: "Guest checkout requires a valid email address.",
          },
          { status: 400 },
        );
      }
    }

    if (
      !isNonEmptyString(shippingName) ||
      !isNonEmptyString(shippingAddress1) ||
      !isNonEmptyString(shippingCity) ||
      !isNonEmptyString(shippingPostalCode) ||
      !isNonEmptyString(shippingCountry) ||
      !isNonEmptyString(shippingPhone)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request: shipping name, address, city, postal code, country, and phone are required.",
        },
        { status: 400 },
      );
    }

    for (const line of items) {
      if (
        typeof line.productId !== "string" ||
        typeof line.quantity !== "number" ||
        line.quantity < 1 ||
        typeof line.unitPrice !== "number" ||
        line.unitPrice < 0
      ) {
        return NextResponse.json(
          { error: "Invalid line item shape." },
          { status: 400 },
        );
      }
      if (
        line.printifyVariantId !== undefined &&
        line.printifyVariantId !== null &&
        typeof line.printifyVariantId !== "string" &&
        typeof line.printifyVariantId !== "number"
      ) {
        return NextResponse.json(
          { error: "Invalid printify_variant_id on line item." },
          { status: 400 },
        );
      }
    }

    if (shippingMethod !== "standard" && shippingMethod !== "express") {
      return NextResponse.json(
        { error: "Invalid shipping method." },
        { status: 400 },
      );
    }

    const shippingAddress2Trimmed =
      typeof shippingAddress2 === "string" && shippingAddress2.trim()
        ? shippingAddress2.trim()
        : null;

    let resolvedUserId: string | null = null;
    let resolvedGuestEmail: string | null = null;
    let receiptEmail: string | undefined;

    if (tokenTrimmed) {
      const sb = createSupabaseUserClient(tokenTrimmed);
      const {
        data: { user },
        error: userError,
      } = await sb.auth.getUser();

      if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      resolvedUserId = user.id;
      resolvedGuestEmail = null;
      if (user.email?.trim()) {
        receiptEmail = user.email.trim();
      }
    } else {
      resolvedGuestEmail =
        typeof guestEmail === "string" ? guestEmail.trim() : "";
      receiptEmail = resolvedGuestEmail || undefined;
    }

    const { total } = computeCheckoutTotalEur(items, shippingMethod);
    const expectedCents = eurToStripeCents(total);

    if (amount !== expectedCents) {
      return NextResponse.json(
        { error: "Amount does not match cart total." },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: resolvedUserId,
        guest_email: resolvedGuestEmail,
        status: "pending",
        total,
        shipping_name: shippingName.trim(),
        shipping_address1: shippingAddress1.trim(),
        shipping_address2: shippingAddress2Trimmed,
        shipping_city: shippingCity.trim(),
        shipping_postal_code: shippingPostalCode.trim(),
        shipping_country: shippingCountry.trim(),
        shipping_phone: shippingPhone.trim(),
        shipping_method: shippingMethod,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("[create-payment-intent] order insert:", orderError);
      return NextResponse.json(
        { error: "Could not create order." },
        { status: 500 },
      );
    }

    const orderId = order.id as string;

    const { error: itemsError } = await admin.from("order_items").insert(
      items.map((line) => ({
        order_id: orderId,
        product_id: line.productId,
        quantity: line.quantity,
        price: line.unitPrice,
        printify_variant_id:
          line.printifyVariantId == null ||
          (typeof line.printifyVariantId === "string" &&
            !line.printifyVariantId.trim())
            ? null
            : String(line.printifyVariantId).trim(),
      })),
    );

    if (itemsError) {
      console.error("[create-payment-intent] order_items insert:", itemsError);
      await admin.from("orders").delete().eq("id", orderId);
      return NextResponse.json(
        { error: "Could not save order lines." },
        { status: 500 },
      );
    }

    const stripe = getStripe();

    const metadata: Record<string, string> = { order_id: orderId };
    if (resolvedUserId) {
      metadata.user_id = resolvedUserId;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      ...(receiptEmail ? { receipt_email: receiptEmail } : {}),
      metadata,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
    });
  } catch (e) {
    console.error("[create-payment-intent]", e);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 },
    );
  }
}
