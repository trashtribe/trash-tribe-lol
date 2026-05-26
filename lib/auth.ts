import type { User } from "@supabase/supabase-js";

import { passwordResetRedirectTo } from "@/lib/password-reset-redirect";
import { createBrowserSupabaseClient } from "@/lib/supabase";

function requireSupabase() {
  const client = createBrowserSupabaseClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return client;
}

export async function signUp(email: string, password: string) {
  const supabase = requireSupabase();
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  const supabase = requireSupabase();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = requireSupabase();
  return supabase.auth.signOut();
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = requireSupabase();
  const redirectTo = passwordResetRedirectTo();
  return supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
}

/** Current user from the session (client-only; returns null if not configured or signed out). */
export async function getUser(): Promise<User | null> {
  const supabase = createBrowserSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
