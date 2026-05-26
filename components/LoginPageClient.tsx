"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { sendPasswordResetEmail } from "@/lib/auth";

const labelClass =
  "text-[11px] font-bold tracking-[0.14em] text-black uppercase";

const inputClass =
  "mt-1 w-full border border-black/15 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none focus:ring-1 focus:ring-black/20";

export function LoginPageClient() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInPending, setSignInPending] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPending, setResetPending] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setSignInPending(true);
    const { error } = await signIn(email.trim(), password);
    setSignInPending(false);
    if (error) {
      setSignInError(error);
      return;
    }
    setPassword("");
    router.push("/account");
  };

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);

    try {
      setResetPending(true);
      const { error } = await sendPasswordResetEmail(resetEmail.trim());
      setResetPending(false);

      if (error) {
        setResetError(error.message);
        return;
      }

      setResetSuccess(true);
    } catch (err) {
      setResetPending(false);
      setResetError(
        err instanceof Error ? err.message : "Could not send reset email.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-center text-2xl font-bold tracking-[0.16em] tt-text-on-light uppercase sm:text-3xl">
        Sign in
      </h1>
      <p className="mt-4 text-center text-sm text-black/55">
        New here?{" "}
        <Link
          href="/account"
          className="underline underline-offset-4 tt-text-secondary hover:opacity-80"
        >
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSignIn} className="mt-10 space-y-5">
        <div>
          <label htmlFor="login-email" className={labelClass}>
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="login-password" className={labelClass}>
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <p className="mt-3 text-center sm:text-left">
            <button
              type="button"
              className="text-sm font-medium uppercase tracking-[0.12em] text-black underline decoration-black/35 underline-offset-4 transition-colors hover:text-[#ff53e3] hover:decoration-[#ff53e3]/60"
              onClick={() => {
                setForgotOpen((open) => {
                  const next = !open;
                  if (next) setResetEmail(email.trim());
                  return next;
                });
                setResetError(null);
                setResetSuccess(false);
              }}
            >
              Forgot your password?
            </button>
          </p>
        </div>

        {signInError ? (
          <p className="text-sm text-[#ff53e3]" role="alert">
            {signInError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={signInPending}
          className="w-full border border-black bg-black py-3.5 text-[11px] font-bold tracking-[0.2em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Sign in
        </button>
      </form>

      {forgotOpen ? (
        <div className="mt-10 border border-black/10 bg-white p-5">
          <h2 className="text-[11px] font-bold tracking-[0.14em] text-black uppercase">
            Reset password
          </h2>
          <p className="mt-2 text-sm text-black/55">
            We&apos;ll send a link to reset your password. Open it on this
            device to choose a new password.
          </p>
          <form onSubmit={handleSendReset} className="mt-5 space-y-4">
            <div>
              <label htmlFor="reset-email-only" className={labelClass}>
                Email
              </label>
              <input
                id="reset-email-only"
                name="resetEmail"
                type="email"
                autoComplete="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            {resetError ? (
              <p className="text-sm text-[#ff53e3]" role="alert">
                {resetError}
              </p>
            ) : null}
            {resetSuccess ? (
              <p className="text-sm tt-text-on-light" role="status">
                Check your inbox for a reset link from Trash Tribe /
                Supabase. It may take a minute to arrive.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={resetPending}
              className="w-full border border-black bg-black py-3 text-[11px] font-bold tracking-[0.2em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {resetPending ? "Sending…" : "Send reset email"}
            </button>
          </form>
        </div>
      ) : null}

      <p className="mt-10 text-center text-[11px] text-black/40">
        <Link href="/" className="underline underline-offset-4 hover:text-black/60">
          Back to shop
        </Link>
      </p>
    </div>
  );
}
