import { createHmac } from "crypto";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/**
 * Per-IP rate limiting backed by Supabase (table rate_limit_events,
 * migration 016). Vercel runs each request on whichever function instance
 * is free, so an in-memory counter would reset constantly — the count has
 * to live somewhere shared.
 *
 * Not perfectly atomic (two simultaneous requests can both pass the count
 * check), which is fine for stopping spam floods on low-traffic forms.
 */

/** Client IP as seen by Vercel's edge (first entry of x-forwarded-for). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Keyed hash so raw IPs are never stored, and can't be recovered by hashing
 * every IPv4 address (the key is a server-only secret). */
function hashKey(value: string): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

/**
 * Records one hit for `bucket` + `key` and returns whether it's allowed:
 * false once `limit` hits already happened within `windowMs`. Fails open
 * (allows) if the database is unreachable, so a Supabase hiccup never
 * blocks real customers from contacting the shop.
 */
export async function checkRateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  try {
    const admin = createSupabaseAdminClient();
    const keyHash = hashKey(key);
    const since = new Date(Date.now() - windowMs).toISOString();

    const { count, error } = await admin
      .from("rate_limit_events")
      .select("id", { count: "exact", head: true })
      .eq("bucket", bucket)
      .eq("key_hash", keyHash)
      .gte("created_at", since);

    if (error) {
      console.error("[rate-limit] count failed; allowing:", error.message);
      return true;
    }
    if ((count ?? 0) >= limit) return false;

    const { error: insertError } = await admin
      .from("rate_limit_events")
      .insert({ bucket, key_hash: keyHash });
    if (insertError) {
      console.error("[rate-limit] insert failed:", insertError.message);
    }
    return true;
  } catch (e) {
    console.error("[rate-limit] unexpected error; allowing:", e);
    return true;
  }
}

/** Deletes rate-limit rows older than a day (called by the daily cron). */
export async function pruneRateLimitEvents(): Promise<void> {
  const admin = createSupabaseAdminClient();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { error } = await admin.from("rate_limit_events").delete().lt("created_at", cutoff);
  if (error) console.error("[rate-limit] prune failed:", error.message);
}
