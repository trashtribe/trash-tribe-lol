import { NextResponse } from "next/server";

import { HONEYPOT_FIELD } from "@/components/HoneypotField";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

/** Messages per IP per hour. */
const MESSAGES_PER_HOUR = 5;

/** Max lengths — generous for real messages, stops huge payloads. */
const MAX_LENGTH = { name: 100, email: 254, subject: 200, message: 5000 } as const;

type Body = {
  [HONEYPOT_FIELD]?: unknown;
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

function missingFields(body: Body): boolean {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  return !name || !email || !subject || !message;
}

export async function POST(request: Request) {
  try {
    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    // Bot filled the hidden field: pretend it worked so it doesn't adapt.
    const honeypot = body[HONEYPOT_FIELD];
    if (typeof honeypot === "string" && honeypot.trim()) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (missingFields(body)) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, subject, message." },
        { status: 400 },
      );
    }

    const name = (body.name as string).trim();
    const email = (body.email as string).trim();
    const subject = (body.subject as string).trim();
    const message = (body.message as string).trim();

    if (
      name.length > MAX_LENGTH.name ||
      email.length > MAX_LENGTH.email ||
      subject.length > MAX_LENGTH.subject ||
      message.length > MAX_LENGTH.message
    ) {
      return NextResponse.json(
        { error: `Please keep your message under ${MAX_LENGTH.message} characters.` },
        { status: 400 },
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!(await checkRateLimit("contact", clientIp(request), MESSAGES_PER_HOUR, 60 * 60 * 1000))) {
      return NextResponse.json(
        { error: "You've sent several messages already. Please try again in an hour, or email hello@trashtribe.lol." },
        { status: 429 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("[contact] RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email delivery is not configured." },
        { status: 500 },
      );
    }

    const emailSubject = `[Contact] ${subject} from ${name}`;
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "noreply@trashtribe.lol",
        to: ["hello@trashtribe.lol"],
        // So "Reply" in the inbox answers the customer, not noreply@.
        reply_to: email,
        subject: emailSubject,
        text,
      }),
    });

    if (!res.ok) {
      const details = await res.text().catch(() => "");
      console.error("[contact] Resend:", res.status, details);
      return NextResponse.json(
        { error: "Failed to send your message. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("[contact]", e);
    return NextResponse.json(
      { error: "Failed to send your message. Please try again." },
      { status: 500 },
    );
  }
}
