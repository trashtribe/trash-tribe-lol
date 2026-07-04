"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

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

type TrackingInfo = {
  status?: string;
  printifyStatus?: string | null;
  tracking?: { carrier?: string | null; number?: string | null; url?: string | null } | null;
  message?: string;
  error?: string;
};

export function AccountPageClient() {
  const router = useRouter();
  const { user, loading, signOut, accessToken } = useAuth();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [tracking, setTracking] = useState<Record<string, TrackingInfo | "loading">>({});

  const checkTracking = useCallback(
    (orderId: string) => {
      if (!accessToken) return;
      setTracking((prev) => ({ ...prev, [orderId]: "loading" }));
      void (async () => {
        try {
          const res = await fetch(`/api/order-tracking?orderId=${encodeURIComponent(orderId)}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = (await res.json()) as TrackingInfo;
          setTracking((prev) => ({
            ...prev,
            [orderId]: res.ok ? data : { error: data.error ?? "Could not check tracking." },
          }));
        } catch {
          setTracking((prev) => ({
            ...prev,
            [orderId]: { error: "Could not check tracking." },
          }));
        }
      })();
    },
    [accessToken],
  );

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) {
      queueMicrotask(() => {
        setOrders([]);
        setOrdersLoading(false);
      });
      return;
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      queueMicrotask(() => {
        setOrders([]);
        setOrdersLoading(false);
      });
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
    // Depend on the id, not the `user` object — a new object reference from
    // AuthProvider on every render would otherwise refetch orders needlessly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      <Link
        href="/wishlist"
        className="mt-6 flex items-center justify-between border border-black/10 bg-white px-6 py-4 text-sm font-bold tracking-[0.1em] tt-text-on-light uppercase transition-colors hover:border-black/30"
      >
        My favourites
        <span aria-hidden="true">→</span>
      </Link>

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
            {orders.map((order) => {
              const t = tracking[order.id];
              return (
                <li
                  key={order.id}
                  className="border border-black/10 bg-white px-4 py-3 sm:px-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
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
                  </div>

                  <div className="mt-3">
                    {!t ? (
                      <button
                        type="button"
                        onClick={() => checkTracking(order.id)}
                        className="text-[11px] font-bold tracking-[0.12em] tt-text-secondary underline underline-offset-4 uppercase"
                      >
                        Check tracking
                      </button>
                    ) : t === "loading" ? (
                      <p className="text-[11px] text-black/50">Checking tracking…</p>
                    ) : t.error ? (
                      <p className="text-[11px] text-black/50">{t.error}</p>
                    ) : (
                      <div className="text-[11px] text-black/70">
                        {t.printifyStatus ? (
                          <p>
                            Fulfillment:{" "}
                            <span className="font-bold">{t.printifyStatus}</span>
                          </p>
                        ) : null}
                        {t.tracking?.number ? (
                          <p className="mt-0.5">
                            {t.tracking.carrier ? `${t.tracking.carrier} — ` : ""}
                            {t.tracking.url ? (
                              <a
                                href={t.tracking.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline underline-offset-4 tt-text-secondary"
                              >
                                {t.tracking.number}
                              </a>
                            ) : (
                              t.tracking.number
                            )}
                          </p>
                        ) : null}
                        {!t.printifyStatus && !t.tracking?.number ? (
                          <p>{t.message ?? "No tracking available yet."}</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
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
