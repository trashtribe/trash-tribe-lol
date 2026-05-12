"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { formatEuro } from "@/lib/format-currency";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type Tab = "signin" | "signup";

function formatJoined(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IE", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

type OrderRow = {
  id: string;
  status: string;
  total: number | string;
  created_at: string;
};

function formatOrderDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IE", {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function AccountPageClient() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formInfo, setFormInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);

    void (async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, total, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;
      setOrdersLoading(false);
      if (error) {
        setOrders([]);
        return;
      }
      setOrders((data ?? []) as OrderRow[]);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormInfo(null);
    setPending(true);
    const { error } = await signIn(email.trim(), password);
    setPending(false);
    if (error) setFormError(error);
    else setPassword("");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormInfo(null);
    setPending(true);
    const { error } = await signUp(email.trim(), password);
    setPending(false);
    if (error) setFormError(error);
    else {
      setPassword("");
      setFormInfo(
        "Check your email to confirm your account, if required by your project settings.",
      );
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-sm tt-text-on-light">Loading…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <h1 className="text-2xl font-bold tracking-[0.16em] tt-text-on-light uppercase sm:text-3xl">
          Account
        </h1>

        <dl className="mt-10 space-y-6 border border-black/10 bg-white p-6">
          <div>
            <dt className="text-[11px] font-bold tracking-[0.14em] text-black/55 uppercase">
              Email
            </dt>
            <dd className="mt-1 text-sm tt-text-on-light">{user.email}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold tracking-[0.14em] text-black/55 uppercase">
              Joined
            </dt>
            <dd className="mt-1 text-sm tt-text-on-light">
              {formatJoined(user.created_at)}
            </dd>
          </div>
        </dl>

        <section className="mt-10">
          <h2 className="text-sm font-bold tracking-[0.18em] tt-text-on-light uppercase">
            Order history
          </h2>
          {ordersLoading ? (
            <div className="mt-4 border border-dashed border-black/20 bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_10%,var(--tt-bg-light))] px-6 py-12 text-center">
              <p className="text-sm tt-text-on-light">Loading orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-4 border border-dashed border-black/20 bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_10%,var(--tt-bg-light))] px-6 py-12 text-center">
              <p className="text-sm tt-text-on-light">
                No orders yet. When you place one, it will show up here.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white px-4 py-3 sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] tracking-tight text-black/70">
                      {order.id.slice(0, 8)}
                    </p>
                    <p className="mt-0.5 text-sm tt-text-on-light">
                      {formatOrderDate(order.created_at)}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center border border-black/15 bg-[color:color-mix(in_srgb,var(--tt-soft-pink)_15%,white)] px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase tt-text-on-light">
                    {order.status}
                  </span>
                  <p className="shrink-0 text-sm font-semibold tabular-nums tt-text-on-light">
                    {formatEuro(Number(order.total))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-10 w-full border border-black bg-black py-3.5 text-[11px] font-bold tracking-[0.2em] text-[#b8ff06] uppercase transition-opacity hover:opacity-90"
        >
          Sign out
        </button>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full border border-black/15 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none focus:ring-1 focus:ring-black/20";
  const labelClass =
    "text-[11px] font-bold tracking-[0.14em] text-black uppercase";

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-center text-2xl font-bold tracking-[0.16em] tt-text-on-light uppercase sm:text-3xl">
        Account
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
          }}
        >
          Create account
        </button>
      </div>

      {tab === "signin" ? (
        <form onSubmit={handleSignIn} className="mt-8 space-y-5">
          <div>
            <label htmlFor="account-email-in" className={labelClass}>
              Email
            </label>
            <input
              id="account-email-in"
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
            <label htmlFor="account-password-in" className={labelClass}>
              Password
            </label>
            <input
              id="account-password-in"
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
      ) : (
        <form onSubmit={handleSignUp} className="mt-8 space-y-5">
          <div>
            <label htmlFor="account-email-up" className={labelClass}>
              Email
            </label>
            <input
              id="account-email-up"
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
            <label htmlFor="account-password-up" className={labelClass}>
              Password
            </label>
            <input
              id="account-password-up"
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
    </div>
  );
}
