"use client";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const supabase = createBrowserSupabaseClient();
    if (!supabase) { setStatus("error"); return; }
    const { error } = await supabase.from("email_signups").insert([{ email }]);
    if (error) { setStatus("error"); } 
    else { setStatus("success"); setEmail(""); }
  }

  return (
    <form className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <label htmlFor="footer-email" className="sr-only">Email</label>
      <input
        id="footer-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading" || status === "success"}
        className="min-h-[44px] flex-1 border tt-border-light bg-[color:var(--tt-bg-light)] px-4 text-[12px] tt-text-on-light placeholder:text-[color:color-mix(in_srgb,var(--tt-text-on-light)_45%,transparent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--tt-accent-secondary)]"
      />
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="tt-bg-primary min-h-[44px] px-6 text-[10px] font-bold tracking-[0.18em] tt-text-on-light uppercase transition-colors hover:tt-text-secondary disabled:opacity-50"
      >
        {status === "loading" ? "..." : status === "success" ? "✓ JOINED" : "Join"}
      </button>
      {status === "error" && <p className="text-xs text-red-500">Something went wrong. Try again.</p>}
    </form>
  );
}
