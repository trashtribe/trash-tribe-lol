import type { SupabaseClient } from "@supabase/supabase-js";

/** Country labels from checkout → ISO 3166-1 alpha-2 for Printify. */
const DISPLAY_COUNTRY_TO_ISO: Record<string, string> = {
  ireland: "IE",
  "united kingdom": "GB",
  france: "FR",
  germany: "DE",
  spain: "ES",
  italy: "IT",
  netherlands: "NL",
  belgium: "BE",
  portugal: "PT",
  austria: "AT",
  sweden: "SE",
  denmark: "DK",
  finland: "FI",
  poland: "PL",
  "united states": "US",
  canada: "CA",
  australia: "AU",
  japan: "JP",
  other: "US",
};

function countryToIso(display: string): string {
  const t = display.trim();
  if (/^[A-Za-z]{2}$/.test(t)) return t.toUpperCase();
  const iso = DISPLAY_COUNTRY_TO_ISO[t.toLowerCase()];
  if (iso) return iso;
  console.warn("[printify fulfillment] Unknown country label; fallback US:", display);
  return "US";
}

function splitShippingName(full: string): { first_name: string; last_name: string } {
  const t = full.trim();
  if (!t) return { first_name: "Customer", last_name: "" };
  const i = t.indexOf(" ");
  if (i <= 0) return { first_name: t, last_name: "" };
  return { first_name: t.slice(0, i).trim(), last_name: t.slice(i + 1).trim() };
}

type OrderShippingRow = {
  id: string;
  user_id: string;
  shipping_name: string | null;
  shipping_address1: string | null;
  shipping_address2: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  shipping_phone: string | null;
};

type OrderLineRow = {
  product_id: string;
  printify_variant_id: string | null;
  quantity: number;
};

/** After an order is marked paid: push to Printify. Never throws. */
export async function submitPaidOrderToPrintify(
  admin: SupabaseClient,
  orderId: string,
): Promise<void> {
  if (process.env.PRINTIFY_FULFILLMENT_ENABLED !== "true") {
    console.log("[Printify] Fulfillment disabled — skipping order submission");
    return;
  }
  try {
    const apiKey = process.env.PRINTIFY_API_KEY?.trim();
    const shopId = process.env.PRINTIFY_SHOP_ID?.trim();

    if (!apiKey || !shopId) {
      console.warn(
        "[printify fulfillment] Missing PRINTIFY_API_KEY or PRINTIFY_SHOP_ID; skipping.",
      );
      return;
    }

    const { data: orderRow, error: orderErr } = await admin
      .from("orders")
      .select(
        `
        id,
        user_id,
        shipping_name,
        shipping_address1,
        shipping_address2,
        shipping_city,
        shipping_postal_code,
        shipping_country,
        shipping_phone
      `,
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !orderRow) {
      console.error("[printify fulfillment] Could not load order:", orderErr);
      return;
    }

    const order = orderRow as OrderShippingRow;

    if (
      !order.shipping_name?.trim() ||
      !order.shipping_address1?.trim() ||
      !order.shipping_city?.trim() ||
      !order.shipping_postal_code?.trim() ||
      !order.shipping_country?.trim() ||
      !order.shipping_phone?.trim()
    ) {
      console.warn(
        "[printify fulfillment] Order missing shipping snapshot; skipping Printify.",
        orderId,
      );
      return;
    }

    const { data: itemRows, error: itemsErr } = await admin
      .from("order_items")
      .select("product_id, printify_variant_id, quantity")
      .eq("order_id", orderId);

    if (itemsErr || !itemRows?.length) {
      console.error("[printify fulfillment] Could not load order_items:", itemsErr);
      return;
    }

    const items = itemRows as OrderLineRow[];
    const line_items: Array<{
      product_id: string;
      variant_id: number;
      quantity: number;
    }> = [];

    for (const row of items) {
      const raw = row.printify_variant_id?.trim() ?? "";
      const variantNum = Number.parseInt(raw, 10);
      if (!Number.isFinite(variantNum)) {
        console.error(
          "[printify fulfillment] Missing or invalid printify_variant_id for line; skipping Printify push.",
          { orderId, product_id: row.product_id },
        );
        return;
      }
      line_items.push({
        product_id: row.product_id,
        variant_id: variantNum,
        quantity: row.quantity,
      });
    }

    let email = "";
    try {
      const { data: userData, error: userErr } =
        await admin.auth.admin.getUserById(order.user_id);
      if (!userErr && userData.user?.email) {
        email = userData.user.email;
      } else if (userErr) {
        console.error("[printify fulfillment] auth.getUserById:", userErr.message);
      }
    } catch (e) {
      console.error("[printify fulfillment] auth.getUserById threw:", e);
    }

    if (!email) {
      console.warn("[printify fulfillment] No user email; sending empty string to Printify.");
    }

    const { first_name, last_name } = splitShippingName(order.shipping_name);
    const countryIso = countryToIso(order.shipping_country);

    const body = {
      external_id: orderId,
      label: `Order ${orderId}`,
      line_items,
      shipping_method: 1,
      shipping_address: {
        first_name,
        last_name,
        address1: order.shipping_address1.trim(),
        address2: (order.shipping_address2 ?? "").trim(),
        city: order.shipping_city.trim(),
        zip: order.shipping_postal_code.trim(),
        country: countryIso,
        phone: order.shipping_phone.trim(),
        email,
      },
    };

    const url = `https://api.printify.com/v1/shops/${encodeURIComponent(shopId)}/orders.json`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const resText = await res.text();

    if (!res.ok) {
      console.error(
        "[printify fulfillment] Printify order create failed:",
        res.status,
        res.statusText,
        resText.slice(0, 2000),
      );
      return;
    }

    console.log("[printify fulfillment] Printify order accepted:", orderId);
  } catch (e) {
    console.error("[printify fulfillment] Unexpected error:", e);
  }
}
