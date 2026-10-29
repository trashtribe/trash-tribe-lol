import { HONEYPOT_FIELD } from "@/components/HoneypotField";

/** Browser side of /api/newsletter, shared by the footer and coming-soon forms. */
export async function subscribeToNewsletter(
  email: string,
  honeypot: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), [HONEYPOT_FIELD]: honeypot }),
    });
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error || "Something went wrong. Try again." };
  } catch {
    return { ok: false, error: "Something went wrong. Try again." };
  }
}
