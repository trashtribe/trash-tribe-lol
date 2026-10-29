"use client";
import { useState } from "react";

import { HoneypotField, honeypotValue } from "@/components/HoneypotField";
import { subscribeToNewsletter } from "@/lib/newsletter-client";

export function ComingSoonNotifyForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    const result = await subscribeToNewsletter(email, honeypotValue(e.currentTarget));
    if (!result.ok) {
      setErrorText(result.error);
      setStatus("error");
    } else {
      setStatus("success");
      setEmail("");
    }
  }

  return (
    <form
      className="relative mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:items-stretch"
      onSubmit={handleSubmit}
    >
      <HoneypotField />
      <label htmlFor="coming-soon-email" className="sr-only">Email</label>
      <input
        id="coming-soon-email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading" || status === "success"}
        className="min-h-10 flex-1 border border-black/20 bg-white px-3 py-2 text-xs text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/30"
      />
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="min-h-10 shrink-0 bg-[#b8ff06] px-5 text-[10px] font-bold tracking-[0.2em] text-black uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "loading" ? "..." : status === "success" ? "✓ DONE" : "NOTIFY ME"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-500">{errorText}</p>
      )}
    </form>
  );
}