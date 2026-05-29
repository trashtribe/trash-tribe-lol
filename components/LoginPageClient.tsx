"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { sendPasswordResetEmail } from "@/lib/auth";

type Tab = "signin" | "signup";

const labelClass =
  "text-[11px] font-bold tracking-[0.14em] text-black uppercase";

const inputClass =
  "mt-1 w-full border border-black/15 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none focus:ring-1 focus:ring-black/20";

export function LoginPageClient() {
  const router = useRouter();
  const { user, loading, signIn, signUp } = useAuth();

  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formInfo, setFormInfo] = useState<string | null>(null);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPending, setResetPending] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/account");
    }
  }, [loading, user, router]);

  const openForgot = () => {
    setForgotOpen(true);
    setResetEmail(email.trim());
    setResetError(null);
    setResetSuccess(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormInfo(null);
    setPending(true);
    const { error } = await signIn(email.trim(), password);
    setPending(false);
    if (error) {
      setFormError(error);
      return;
    }
    setPassword("");
    router.push("/account");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormInfo(null);
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    setPending(true);
    const { error } = await signUp(email.trim(), password);
    setPending(false);
    if (error) {
      setFormError(error);
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setFormInfo(
      "Check your email to confirm your account, if required by your project settings.",
    );
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

  if (loading || user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-sm tt-text-on-light">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-center text-2xl font-bold tracking-[0.16em] tt-text-on-light uppercase sm:text-3xl">
        {tab === "signin" ? "Sign in" : "Create account"}
      </h1>

      <div
        className="mt-8 flex border-b border-black/15"
        role="tablist"
        aria-label="Sign in or create account"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "signin"}
          className={`flex-1 border-b-2 py-3 text-[11px] font-bold tracking-[0.18em] uppercase transition-colors ${
            tab === "signin"
              ? "border-black tt-text-on-light"
              : "border-transparent text-black/45 hover:text-black/70"
          }`}
          onClick={() => {
            setTab("signin");
            setFormError(null);
            setFormInfo(null);
            setForgotOpen(false);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "signup"}
          className={`flex-1 border-b-2 py-3 text-[11px] font-bold tracking-[0.18em] uppercase transition-colors ${
            tab === "signup"
              ? "border-black tt-text-on-light"
              : "border-transparent text-black/45 hover:text-black/70"
          }`}
          onClick={() => {
            setTab("signup");
            setFormError(null);
            setFormInfo(null);
            setForgotOpen(false);
            setConfirmPassword("");
          }}
        >
          Create account
        </button>
      </div>

      {tab === "signin" ? (
        <>
          <form onSubmit={handleSignIn} className="mt-8 space-y-5">
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
            </div>

            {formError ? (
              <p className="text-sm text-[#ff53e3]" role="alert">
                {formError}
              </p>
            ) : null}
            {formInfo ? (
              <p className="text-sm tt-text-on-light" role="status">
                {formInfo}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="w-full border border-black bg-black py-3.5 text-[11px] font-bold tracking-[0.2em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              Sign in
            </button>
          </form>

          <p className="mt-4 text-center">
            <button
              type="button"
              id="forgot-password-trigger"
              onClick={openForgot}
              className="cursor-pointer border-0 bg-transparent p-0 text-sm font-normal text-[#ff53e3] underline underline-offset-4 hover:opacity-80"
            >
              Forgot your password?
            </button>
          </p>

          {forgotOpen ? (
            <section
              className="mt-8 border border-black/15 bg-white p-5"
              aria-labelledby="reset-password-heading"
            >
              <h2
                id="reset-password-heading"
                className="text-[11px] font-bold tracking-[0.14em] text-black uppercase"
              >
                Reset password
              </h2>
              <p className="mt-2 text-sm text-black/55">
                Enter your email and we&apos;ll send you a link to set a new
                password.
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
                  <p className="text-sm text-black/70" role="status">
                    Check your inbox for a reset link. It may take a minute to
                    arrive.
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
            </section>
          ) : null}
        </>
      ) : (
        <form onSubmit={handleSignUp} className="mt-8 space-y-5">
          <div>
            <label htmlFor="signup-email" className={labelClass}>
              Email
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className={labelClass}>
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-black/45">
              At least 6 characters.
            </p>
          </div>
          <div>
            <label htmlFor="signup-password-confirm" className={labelClass}>
              Confirm password
            </label>
            <input
              id="signup-password-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {formError ? (
            <p className="text-sm text-[#ff53e3]" role="alert">
              {formError}
            </p>
          ) : null}
          {formInfo ? (
            <p className="text-sm tt-text-on-light" role="status">
              {formInfo}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full border border-black bg-black py-3.5 text-[11px] font-bold tracking-[0.2em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Create account
          </button>
        </form>
      )}

      <p className="mt-10 text-center text-[11px] text-black/40">
        <Link href="/" className="underline underline-offset-4 hover:text-black/60">
          Back to shop
        </Link>
      </p>
    </div>
  );
}
