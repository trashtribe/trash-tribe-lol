"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as auth from "@/lib/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase";

type AuthResult = { error?: string };

type AuthContextValue = {
  user: User | null;
  /** JWT from the current Supabase session, for authenticated API routes. Null if signed out or no client. */
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) {
      setUser(null);
      setAccessToken(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const subRef: { current: { unsubscribe: () => void } | null } = {
      current: null,
    };

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setLoading(false);

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (cancelled) return;
        setUser(nextSession?.user ?? null);
        setAccessToken(nextSession?.access_token ?? null);
      });

      if (cancelled) {
        subscription.unsubscribe();
        return;
      }
      subRef.current = subscription;
    })();

    return () => {
      cancelled = true;
      subRef.current?.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await auth.signIn(email, password);
      if (error) return { error: error.message };
      return {};
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign in failed.";
      return { error: message };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await auth.signUp(email, password);
      if (error) return { error: error.message };
      return {};
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign up failed.";
      return { error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
    } catch {
      /* still clear local session via listener */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, accessToken, loading, signIn, signUp, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
