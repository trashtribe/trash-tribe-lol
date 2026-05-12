import { NextResponse } from "next/server";

type Body = {
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
