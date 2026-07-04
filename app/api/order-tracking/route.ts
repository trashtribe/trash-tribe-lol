import { NextResponse } from "next/server";

import { fetchPrintifyOrderById } from "@/lib/printify";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseUserClient } from "@/lib/supabase-route";

/** Avoid hammering Printify's API if the customer refreshes repeatedly. */
const MIN_RECHECK_MS = 60_000;

type OrderTrackingRow = {
  id: string;
  user_id: string | null;
  status: string;
  printify_order_id: string | null;
  printify_status: string | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  tracking_checked_at: string | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId")?.trim();

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required." }, { status: 400 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userClient = createSupabaseUserClient(accessToken);
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const { data: orderRow, error: orderError } = await admin
    .from("orders")
    .select(
      "id, user_id, status, printify_order_id, printify_status, tracking_carrier, tracking_number, tracking_url, tracking_checked_at",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !orderRow) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const order = orderRow as OrderTrackingRow;

  // Only the order's owner may look up its tracking.
  if (order.user_id !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!order.printify_order_id) {
    return NextResponse.json({
      status: order.status,
      printifyStatus: null,
      tracking: null,
      message: "Not sent to fulfillment yet.",
    });
  }

  const lastChecked = order.tracking_checked_at ? new Date(order.tracking_checked_at).getTime() : 0;
  const isFresh = Date.now() - lastChecked < MIN_RECHECK_MS;

  if (isFresh) {
    return NextResponse.json({
      status: order.status,
      printifyStatus: order.printify_status,
      tracking:
        order.tracking_number || order.tracking_url
          ? {
              carrier: order.tracking_carrier,
              number: order.tracking_number,
              url: order.tracking_url,
            }
          : null,
    });
  }

  try {
    const printifyOrder = await fetchPrintifyOrderById(order.printify_order_id);

    if (!printifyOrder) {
      return NextResponse.json({
        status: order.status,
        printifyStatus: order.printify_status,
        tracking: null,
        message: "Printify has no record of this order yet.",
      });
    }

    const shipment = printifyOrder.shipments?.[0];
    const tracking = shipment?.number
      ? {
          carrier: shipment.carrier ?? null,
          number: shipment.number,
          url: shipment.url ?? null,
        }
      : null;

    await admin
      .from("orders")
      .update({
        printify_status: printifyOrder.status ?? null,
        tracking_carrier: tracking?.carrier ?? null,
        tracking_number: tracking?.number ?? null,
        tracking_url: tracking?.url ?? null,
        tracking_checked_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return NextResponse.json({
      status: order.status,
      printifyStatus: printifyOrder.status ?? null,
      tracking,
    });
  } catch (e) {
    console.error("[order-tracking] Printify lookup failed:", e);
    return NextResponse.json({
      status: order.status,
      printifyStatus: order.printify_status,
      tracking:
        order.tracking_number || order.tracking_url
          ? {
              carrier: order.tracking_carrier,
              number: order.tracking_number,
              url: order.tracking_url,
            }
          : null,
      message: "Could not refresh tracking right now — showing last known status.",
    });
  }
}
