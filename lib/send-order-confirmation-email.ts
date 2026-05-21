import type { SupabaseClient } from "@supabase/supabase-js";

import { formatEuro } from "@/lib/format-currency";

const LOGO_URL =
  "https://raw.githubusercontent.com/raverbunny01/trash-tribe-lol/main/public/ttt.png";

type OrderRow = {
  total: number | string;
  shipping_name: string | null;
  shipping_address1: string | null;
  shipping_address2: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
  shipping_method: string | null;
  created_at: string;
  user_id: string | null;
  guest_email: string | null;
};

type ItemRow = {
  product_id: string;
  quantity: number;
  price: number | string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function siteOrigin(): string {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (u) return u.replace(/\/+$/, "");
  return "https://trash-tribe.lol";
}

function estimateDeliveryPhrase(method: string | null | undefined): string {
  if (method === "express") {
    return "Estimated delivery: 2–3 business days (express shipping).";
  }
  return "Estimated delivery: 5–7 business days (standard shipping).";
}

function formatAddressInnerHtml(order: OrderRow): string {
  const rows: string[] = [];
  if (order.shipping_name?.trim()) rows.push(order.shipping_name.trim());
  if (order.shipping_address1?.trim()) rows.push(order.shipping_address1.trim());
  if (order.shipping_address2?.trim()) rows.push(order.shipping_address2.trim());
  const cityPostal = [order.shipping_city?.trim(), order.shipping_postal_code?.trim()]
    .filter(Boolean)
    .join(", ");
  if (cityPostal) rows.push(cityPostal);
  if (order.shipping_country?.trim()) rows.push(order.shipping_country.trim());
  if (order.shipping_phone?.trim()) rows.push(order.shipping_phone.trim());

  if (rows.length === 0) return "<p style=\"margin:8px 0;\">—</p>";
  return rows
    .map((line) => `<p style="margin:4px 0;">${escapeHtml(line)}</p>`)
    .join("");
}

function buildOrderConfirmationHtml(opts: {
  orderIdShort: string;
  itemsLines: Array<{ title: string; lineTotal: string }>;
  orderTotalFormatted: string;
  addressInnerHtml: string;
  estimatedDelivery: string;
  ordersUrl: string;
}): string {
  const itemRowsHtml = opts.itemsLines
    .map(
      (row) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">${escapeHtml(row.title)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${escapeHtml(row.lineTotal)}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Your Trash Tribe order is confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f6f6f6;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f6f6;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #eaeaea;">
<tr><td style="padding:36px 32px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,'Liberation Mono','Courier New',monospace;font-size:13px;line-height:1.55;color:#111111;">
<img src="${LOGO_URL}" alt="Trash Tribe" width="132" height="132" style="display:block;margin:0 auto 28px;width:132px;height:auto;max-width:100%;border:0;"/>
<p style="margin:0 0 14px;text-align:center;text-transform:uppercase;letter-spacing:0.18em;font-size:11px;font-weight:bold;color:#555;">Order confirmed</p>
<h1 style="margin:0 0 28px;text-align:center;font-size:17px;font-weight:bold;letter-spacing:0.04em;line-height:1.3;">Thanks — we got your order</h1>
<p style="margin:0 0 8px;">Order reference:</p>
<p style="margin:0 0 28px;text-align:center;font-size:26px;font-weight:bold;letter-spacing:0.12em;"><span>${escapeHtml(opts.orderIdShort)}</span></p>

<p style="margin:24px 0 10px;text-transform:uppercase;letter-spacing:0.16em;font-size:11px;font-weight:bold;color:#555;">Items</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
${itemRowsHtml}
<tr><td style="padding:14px 0 0;color:#555;">Total</td><td style="padding:14px 0 0;text-align:right;font-weight:bold;color:#111;">${escapeHtml(opts.orderTotalFormatted)}</td></tr>
</table>

<p style="margin:32px 0 10px;text-transform:uppercase;letter-spacing:0.16em;font-size:11px;font-weight:bold;color:#555;">Ship to</p>
<div style="margin:0 0 28px;color:#222;">${opts.addressInnerHtml}</div>

<p style="margin:0 0 28px;line-height:1.6;color:#444;">${escapeHtml(opts.estimatedDelivery)}</p>

<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;"><tr><td bgcolor="#000000" style="background-color:#000000;padding:13px 32px;text-align:center"><a href="${escapeHtml(opts.ordersUrl)}" style="display:inline-block;font-family:inherit;font-size:11px;font-weight:bold;color:#b8ff06;text-decoration:none;text-transform:uppercase;letter-spacing:0.2em;">VIEW ORDERS</a></td></tr></table>

<p style="margin:36px 0 0;color:#777;font-size:11px;line-height:1.5;text-align:center;">Trash Tribe • Independent merch</p>
</td></tr></table>
</td></tr></table>
</body></html>`;
}

/** Bearer token matches one of these env vars (preferred: INTERNAL_ORDER_EMAIL_SECRET). */
export function verifySendOrderConfirmationAuth(request: Request): boolean {
  const secrets = [
    process.env.INTERNAL_ORDER_EMAIL_SECRET?.trim(),
    process.env.INTERNAL_API_SECRET?.trim(),
  ].filter((s): s is string => Boolean(s));
  if (secrets.length === 0) return false;
  const auth = request.headers.get("authorization");
  const token =
    typeof auth === "string" && auth.startsWith("Bearer ")
      ? auth.slice("Bearer ".length).trim()
      : "";
  return secrets.some((s) => s === token);
}

export async function sendOrderConfirmationEmail(
  admin: SupabaseClient,
  orderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not set." };
  }

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select(
      `total,
      shipping_name,
      shipping_address1,
      shipping_address2,
      shipping_city,
      shipping_postal_code,
      shipping_country,
      shipping_phone,
      shipping_method,
      created_at,
      user_id,
      guest_email`,
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return { ok: false, error: orderErr?.message ?? "Order not found." };
  }

  const o = order as OrderRow;

  let toEmail = "";

  if (o.user_id) {
    const { data: userData, error: userErr } =
      await admin.auth.admin.getUserById(o.user_id);
    if (!userErr && userData?.user?.email?.trim()) {
      toEmail = userData.user.email.trim();
    } else if (userErr) {
      console.error("[send-order-confirmation] getUserById:", userErr.message);
    }
  }

  if (!toEmail && o.guest_email?.trim()) {
    toEmail = o.guest_email.trim();
  }

  if (!toEmail) {
    return {
      ok: false,
      error: "Could not resolve customer email for this order.",
    };
  }

  const { data: itemRows, error: itemsErr } = await admin
    .from("order_items")
    .select("product_id, quantity, price")
    .eq("order_id", orderId);

  if (itemsErr || !itemRows?.length) {
    return { ok: false, error: itemsErr?.message ?? "No order line items." };
  }

  const items = itemRows as ItemRow[];
  const itemsLines = items.map((row) => {
    const unit = Number(row.price);
    const qty = Number(row.quantity);
    const safeUnit = Number.isFinite(unit) ? unit : 0;
    const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 0;
    const lineTotalFmt = formatEuro(safeUnit * safeQty);
    const title = `${row.product_id} × ${safeQty}`;
    return { title, lineTotal: lineTotalFmt };
  });

  const totalNum = Number(o.total);
  const orderTotalFormatted = formatEuro(Number.isFinite(totalNum) ? totalNum : 0);
  const orderIdShort = orderId.slice(0, 8).toUpperCase();
  const addressInnerHtml = formatAddressInnerHtml(o);
  const estimatedDelivery = estimateDeliveryPhrase(o.shipping_method ?? undefined);

  const base = siteOrigin();
  const ordersUrl = `${base}/account`;

  const html = buildOrderConfirmationHtml({
    orderIdShort,
    itemsLines,
    orderTotalFormatted,
    addressInnerHtml,
    estimatedDelivery,
    ordersUrl,
  });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "noreply@trashtribe.lol",
      to: [toEmail],
      subject: "Your Trash Tribe order is confirmed",
      html,
    }),
  });

  if (!res.ok) {
    const details = await res.text().catch(() => "");
    console.error("[send-order-confirmation] Resend error:", res.status, details);
    return { ok: false, error: "Resend rejected the send." };
  }

  return { ok: true };
}
