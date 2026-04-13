"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase";

const STORAGE_KEY = "trashtribe-wishlist-ids";

type WishlistContextValue = {
  ids: string[];
  count: number;
  hydrated: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);

function readStoredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function persistLocal(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota */
  }
}

async function fetchWishlistProductIds(
  userId: string,
): Promise<string[] | null> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("wishlist")
    .select("product_id")
    .eq("user_id", userId);

  if (error) {
    console.error("[wishlist] fetch failed:", error.message);
    return null;
  }

  return (data ?? []).map((row) => row.product_id as string);
}

async function mergeLocalIntoSupabase(userId: string, localIds: string[]) {
  const supabase = createBrowserSupabaseClient();
  if (!supabase || localIds.length === 0) return;

  for (const product_id of localIds) {
    const { error } = await supabase.from("wishlist").insert({
      user_id: userId,
      product_id,
    });
    if (error && error.code !== "23505") {
      console.error("[wishlist] merge failed:", error.message);
    }
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const idsRef = useRef<string[]>([]);
  idsRef.current = ids;

  useEffect(() => {
    setIds(readStoredIds());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    persistLocal(ids);
  }, [ids, hydrated]);

  // When signed in: merge local wishlist into Supabase, then load server rows.
  // `onAuthStateChange` also runs once with INITIAL_SESSION.
  useEffect(() => {
    if (!hydrated) return;

    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    let cancelled = false;

    const syncForUser = async (userId: string) => {
      const local =
        idsRef.current.length > 0 ? idsRef.current : readStoredIds();
      if (local.length > 0) {
        await mergeLocalIntoSupabase(userId, local);
      }
      const serverIds = await fetchWishlistProductIds(userId);
      if (cancelled || !serverIds) return;
      setIds(serverIds);
      persistLocal(serverIds);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;

      if (
        session?.user &&
        (event === "INITIAL_SESSION" || event === "SIGNED_IN")
      ) {
        await syncForUser(session.user.id);
        return;
      }

      if (event === "SIGNED_OUT") {
        setIds(readStoredIds());
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [hydrated]);

  const syncToggleToSupabase = useCallback(
    async (productId: string, removing: boolean) => {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) return;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      const uid = session.user.id;

      if (removing) {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", uid)
          .eq("product_id", productId);
        if (error) {
          console.error("[wishlist] delete failed:", error.message);
        }
      } else {
        const { error } = await supabase.from("wishlist").insert({
          user_id: uid,
          product_id: productId,
        });
        if (error && error.code !== "23505") {
          console.error("[wishlist] insert failed:", error.message);
        }
      }
    },
    [],
  );

  const isInWishlist = useCallback(
    (productId: string) => ids.includes(productId),
    [ids],
  );

  const toggleWishlist = useCallback(
    (productId: string) => {
      setIds((prev) => {
        const removing = prev.includes(productId);
        const next = removing
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        void syncToggleToSupabase(productId, removing);
        return next;
      });
    },
    [syncToggleToSupabase],
  );

  const removeFromWishlist = useCallback(
    (productId: string) => {
      setIds((prev) => {
        if (!prev.includes(productId)) return prev;
        void syncToggleToSupabase(productId, true);
        return prev.filter((id) => id !== productId);
      });
    },
    [syncToggleToSupabase],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      count: ids.length,
      hydrated,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
    }),
    [ids, hydrated, isInWishlist, toggleWishlist, removeFromWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return ctx;
}
