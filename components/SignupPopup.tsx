"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/AuthProvider";

const DISMISSED_KEY = "tt-signup-popup-dismissed";
const SHOW_AFTER_MS = 12000;

/**
 * Low-key signup nudge for logged-out visitors browsing the shop grid —
 * the only other places we invite sign-up are a small header link and two
 * lines of checkout copy, easy to miss entirely. Shows once, after a delay
 * (so it isn't the first thing a new visitor sees), and never again once
 * dismissed or signed in.
 */
export function SignupPopup() {
  const { user, loading } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading || user) return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // Storage unavailable (private browsing, etc.) — fall back to showing it.
    }
    if (dismissed) return;

    const timer = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [loading, user]);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Non-fatal — worst case it can show again next visit.
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Create an account"
      className="fixed bottom-4 left-4 right-4 z-[110] mx-auto max-w-sm border tt-border-light bg-background p-5 shadow-[0_8px_30px_rgba(0,0,0,0.18)] sm:left-auto sm:right-4"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-sm leading-none tt-text-on-light transition-colors hover:tt-text-secondary"
      >
        ×
      </button>
      <p className="pr-6 text-[11px] font-bold tracking-[0.14em] tt-text-on-light uppercase">
        Join trashtribe
      </p>
      <p className="mt-2 text-sm leading-relaxed tt-text-on-light">
        Create a free account to save favourites, track your orders, and get first access to new
        drops and subscriber-only offers.
      </p>
      <div className="mt-4 flex gap-2">
        <Link
          href="/login?tab=signup"
          onClick={dismiss}
          className="flex-1 bg-[color:var(--tt-bg-dark)] px-4 py-2.5 text-center text-[11px] font-bold tracking-[0.16em] tt-text-primary uppercase transition-colors hover:tt-text-secondary"
        >
          Sign up
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="px-4 py-2.5 text-[11px] font-bold tracking-[0.16em] tt-text-on-light uppercase underline underline-offset-4 transition-colors hover:tt-text-secondary"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
