/**
 * Redirect URL embedded in Supabase password-recovery emails.
 * Override for local/dev: NEXT_PUBLIC_PASSWORD_RESET_REDIRECT_URL=http://localhost:3000/reset-password
 * Dashboard → Auth → Redirect URLs must allow this exact URL.
 */
export function passwordResetRedirectTo(): string {
  const explicit = process.env.NEXT_PUBLIC_PASSWORD_RESET_REDIRECT_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  return "https://www.trashtribe.lol/reset-password";
}
