"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase";

const labelClass =
  "text-[11px] font-bold tracking-[0.14em] text-black uppercase";

const inputClass =
  "mt-1 w-full border border-black/15 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none focus:ring-1 focus:ring-black/20";

export function ResetPasswordPageClient() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sb = createBrowserSupabaseClient();
    if (!sb) {
      setChecking(false);
      setBlockedReason("Sign-in is not configured on this deployment.");
      return;
    }

    let cancelled = false;
    let watchdog: ReturnType<typeof setTimeout> | undefined;

    const settleOk = () => {
      if (cancelled) return;
      if (watchdog !== undefined) {
        clearTimeout(watchdog);
        watchdog = undefined;
      }
      setReady(true);
      setBlockedReason(null);
      setChecking(false);
    };

    const settleErr = (msg: string) => {
      if (cancelled) return;
      if (watchdog !== undefined) {
        clearTimeout(watchdog);
        watchdog = undefined;
      }
      setReady(false);
      setBlockedReason(msg);
      setChecking(false);
    };

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" && session?.user) {
        settleOk();
      }
    });

    void (async () => {
      const href =
        typeof window !== "undefined" ? window.location.href : "";
      try {
        if (href.includes("code=")) {
          const { error } = await sb.auth.exchangeCodeForSession(href);
          if (error) {
            console.warn("[reset-password] exchangeCodeForSession:", error.message);
          }
        }
      } catch (e) {
        console.warn("[reset-password] PKCE exchange:", e);
      }

      if (cancelled) return;

      const {
        data: { session },
      } = await sb.auth.getSession();

      if (cancelled) return;

      if (session?.user) {
        settleOk();
        return;
      }

      watchdog = setTimeout(() => {
        if (cancelled) return;
        void sb.auth.getSession().then(({ data }) => {
          if (cancelled) return;
          if (data.session?.user) {
            settleOk();
          } else {
            settleErr(
              "This reset link is invalid or has expired. Request a new one from login.",
            );
          }
        });
      }, 6000);

    })();

    return () => {
      cancelled = true;
      if (watchdog !== undefined) clearTimeout(watchdog);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password !== confirm) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setFormError("Use at least 6 characters.");
      return;
    }

    const sb = createBrowserSupabaseClient();
    if (!sb) {
      setFormError("Sign-in is not configured.");
      return;
    }

    setSubmitting(true);
    const { error } = await sb.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setDone(true);
    setPassword("");
    setConfirm("");
    window.setTimeout(() => {
      router.push("/account");
    }, 1400);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-center text-2xl font-bold tracking-[0.16em] tt-text-on-light uppercase sm:text-3xl">
        New password
      </h1>
      <p className="mt-4 text-center text-sm text-black/55">
        Enter a new password for your Trash Tribe account.
      </p>

      {checking ? (
        <p className="mt-12 text-center text-sm tt-text-on-light">
          Verifying link…
        </p>
      ) : null}

      {blockedReason && !checking ? (
        <div className="mt-10 space-y-4 text-center">
          <p className="text-sm text-[#ff53e3]" role="alert">
            {blockedReason}
          </p>
          <p>
            <Link
              href="/login"
              className="text-sm underline underline-offset-4 tt-text-secondary hover:opacity-80"
            >
              Back to login
            </Link>
          </p>
        </div>
      ) : null}

      {ready && !done ? (
        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label htmlFor="new-password" className={labelClass}>
              New password
            </label>
            <input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className={labelClass}>
              Confirm password
            </label>
            <input
              id="confirm-new-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </div>

          {formError ? (
            <p className="text-sm text-[#ff53e3]" role="alert">
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full border border-black bg-black py-3.5 text-[11px] font-bold tracking-[0.2em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Update password"}
          </button>
        </form>
      ) : null}

      {done ? (
        <p className="mt-12 text-center text-sm tt-text-on-light">
          Password updated — redirecting to your account…
        </p>
      ) : null}

      <p className="mt-12 text-center text-[11px] text-black/40">
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-black/60"
        >
          Sign in
        </Link>
        {" · "}
        <Link href="/" className="underline underline-offset-4 hover:text-black/60">
          Shop
        </Link>
      </p>
    </div>
  );
}
