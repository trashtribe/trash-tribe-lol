import { NextResponse } from "next/server";

import {
  sendOrderConfirmationEmail,
  verifySendOrderConfirmationAuth,
} from "@/lib/send-order-confirmation-email";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type Body = { orderId?: unknown };

const UUID_LIKE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Internal-only route: Stripe webhook forwards here with Bearer secret so we don’t expose
 * a public confirmation-email endpoint.
 */
export async function POST(request: Request) {
  console.log("[send-order-confirmation] POST received");

  try {
    const hasOrderEmailSecret = Boolean(
      process.env.INTERNAL_ORDER_EMAIL_SECRET?.trim(),
    );
    const hasApiSecretFallback = Boolean(process.env.INTERNAL_API_SECRET?.trim());
    const authHeaderPresent = Boolean(request.headers.get("authorization"));
    const authHeader = request.headers.get("authorization");
    const bearerFormatOk =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ");

    const tokenMatches = verifySendOrderConfirmationAuth(request);

    console.log("[send-order-confirmation] auth check:", {
      hasAuthorizationHeader: authHeaderPresent,
      bearerPrefixOk: bearerFormatOk,
      internalOrderEmailSecretSet: hasOrderEmailSecret,
      internalApiSecretSet: hasApiSecretFallback,
      tokenMatchesINTERNAL_ORDER_EMAIL_SECRET_or_FALLBACK: tokenMatches,
    });

    if (!tokenMatches) {
      console.log(
        "[send-order-confirmation] Forbidden: Bearer token did not match INTERNAL_ORDER_EMAIL_SECRET (or INTERNAL_API_SECRET fallback).",
      );
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    console.log(
      "[send-order-confirmation] Bearer token matched configured secret.",
    );

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      console.log("[send-order-confirmation] Invalid JSON body");
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const rawId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!rawId || !UUID_LIKE.test(rawId)) {
      console.log("[send-order-confirmation] Invalid orderId in body:", rawId);
      return NextResponse.json({ error: "Invalid orderId." }, { status: 400 });
    }

    console.log("[send-order-confirmation] orderId:", rawId);

    const admin = createSupabaseAdminClient();
    const result = await sendOrderConfirmationEmail(admin, rawId);

    console.log(
      "[send-order-confirmation] Supabase + Resend trace:",
      JSON.stringify(result.trace),
    );

    if (!result.ok) {
      console.log(
        "[send-order-confirmation] Send failed:",
        result.error ?? "(no message)",
      );
      return NextResponse.json(
        { error: result.error ?? "Send failed." },
        { status: 500 },
      );
    }

    console.log("[send-order-confirmation] Resend reported success (HTTP OK).");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[send-order-confirmation] Uncaught:", e);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
