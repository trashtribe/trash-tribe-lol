import { NextResponse } from "next/server";

import { HONEYPOT_FIELD } from "@/components/HoneypotField";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/** Signups per IP per hour — plenty for a household, stops scripted floods. */
const SIGNUPS_PER_HOUR = 5;

function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Newsletter / coming-soon signup. Replaces the browser inserting straight
 * into email_signups with the anon key, which had no way to limit abuse.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Bot filled the hidden field: pretend it worked so it doesn't adapt.
  if (typeof body[HONEYPOT_FIELD] === "string" && body[HONEYPOT_FIELD].trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!(await checkRateLimit("newsletter", clientIp(request), SIGNUPS_PER_HOUR, 60 * 60 * 1000))) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("email_signups").insert({ email });
    // 23505 = already signed up (unique email); still a success for the visitor.
    if (error && error.code !== "23505") {
      console.error("[newsletter] insert failed:", error.message);
      return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[newsletter]", e);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
