import type { AuthError, User } from "@supabase/supabase-js";

import { passwordResetRedirectTo } from "@/lib/password-reset-redirect";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export type PasswordResetErrorDetails = {
  message: string;
  status: number | null;
  code: string | null;
  /** Human-readable line for the UI (message + code + status). */
  displayMessage: string;
};

export type PasswordResetResult = {
  data: unknown;
  redirectTo: string;
  error: PasswordResetErrorDetails | null;
};

function formatSupabaseAuthError(error: AuthError): PasswordResetErrorDetails {
  const message = error.message || "Unknown Supabase auth error";
  const status = error.status ?? null;
  const code = error.code ?? null;
  const extra = [
    code ? `code: ${code}` : null,
    status != null ? `status: ${status}` : null,
  ].filter(Boolean);
  const displayMessage =
    extra.length > 0 ? `${message} (${extra.join(", ")})` : message;
  return { message, status, code, displayMessage };
}

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

/**
 * Sends Supabase password recovery email.
 *
 * If this fails with "Error sending recovery email", verify in Supabase Dashboard:
 * - Authentication → Email Templates → Reset Password (template present / not disabled)
 * - Authentication → Providers → Email (provider enabled; SMTP or built-in mail configured)
 * - Authentication → URL Configuration → Redirect URLs includes `redirectTo` exactly
 * - Project Settings → Auth → Site URL is consistent with your app origin
 */
export async function sendPasswordResetEmail(
  email: string,
): Promise<PasswordResetResult> {
  const supabase = requireSupabase();
  const redirectTo = passwordResetRedirectTo();
  const trimmedEmail = email.trim();

  const { data, error } = await supabase.auth.resetPasswordForEmail(
    trimmedEmail,
    { redirectTo },
  );

  if (error) {
    const details = formatSupabaseAuthError(error);
    console.error("[auth] resetPasswordForEmail Supabase error:", {
      message: details.message,
      status: details.status,
      code: details.code,
      redirectTo,
      raw: error,
    });
    return { data: null, redirectTo, error: details };
  }

  return { data, redirectTo, error: null };
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
