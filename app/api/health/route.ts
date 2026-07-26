import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/**
 * Lightweight health check, pinged daily by the Vercel Cron job in
 * vercel.json. Its main job is to make a real request against Supabase so
 * the free-tier project never sits idle long enough to auto-pause — the
 * "have to reactivate Supabase" issue hit after this project sat untouched
 * for a month (jul 2026).
 */
export async function GET() {
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("profiles").select("id").limit(1);

    if (error) {
      console.error("[health] Supabase ping failed:", error.message);
      return NextResponse.json({ ok: false, supabase: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true, supabase: true, checkedAt: new Date().toISOString() });
  } catch (e) {
    console.error("[health] Unexpected error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
