import { NextResponse } from "next/server";

import {
  computeCheckoutTotalEur,
  eurToStripeCents,
  type CheckoutLineInput,
} from "@/lib/checkout-totals";
import { getStripe } from "@/lib/stripe-server";
import { createSupabaseUserClient } from "@/lib/supabase-route";

type Body = {
  amount?: number;
  currency?: string;
  accessToken?: string;
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const {
      amount,
      currency = "eur",
      accessToken,
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

    if (
      typeof amount !== "number" ||
      amount < 50 ||
      !accessToken ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid request: amount, accessToken, and items are required." },
        { status: 400 },
      );
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
        { error: "Invalid request: shipping name, address, city, postal code, country, and phone are required." },
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
      return NextResponse.json({ error: "Invalid shipping method." }, { status: 400 });
    }

    const shippingAddress2Trimmed =
      typeof shippingAddress2 === "string" && shippingAddress2.trim()
        ? shippingAddress2.trim()
        : null;

    const supabase = createSupabaseUserClient(accessToken);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { total } = computeCheckoutTotalEur(
      items,
      shippingMethod,
    );
    const expectedCents = eurToStripeCents(total);

    if (amount !== expectedCents) {
      return NextResponse.json(
        { error: "Amount does not match cart total." },
        { status: 400 },
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
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

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((line) => ({
        order_id: orderId,
        product_id: line.productId,
        quantity: line.quantity,
        price: line.unitPrice,
        printify_variant_id:
          line.printifyVariantId == null ||
          (typeof line.printifyVariantId === "string" && !line.printifyVariantId.trim())
            ? null
            : String(line.printifyVariantId).trim(),
      })),
    );

    if (itemsError) {
      console.error("[create-payment-intent] order_items insert:", itemsError);
      await supabase.from("orders").delete().eq("id", orderId);
      return NextResponse.json(
        { error: "Could not save order lines." },
        { status: 500 },
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: orderId,
        user_id: user.id,
      },
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
