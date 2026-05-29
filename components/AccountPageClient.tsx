"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { formatEuro } from "@/lib/format-currency";
import { createBrowserSupabaseClient } from "@/lib/supabase";

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
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

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

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-sm tt-text-on-light">Loading…</p>
      </div>
    );
  }

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
