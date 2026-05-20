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
  try {
    if (!verifySendOrderConfirmationAuth(request)) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const rawId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!rawId || !UUID_LIKE.test(rawId)) {
      return NextResponse.json({ error: "Invalid orderId." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    const result = await sendOrderConfirmationEmail(admin, rawId);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Send failed." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[send-order-confirmation]", e);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
