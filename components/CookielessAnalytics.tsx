"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics: page views counted without cookies or any
 * identifier stored on the visitor's device, so no consent banner is
 * needed (described in the privacy policy). Doesn't run in development.
 *
 * The URL fragment is dropped before sending: Supabase's password-reset
 * links carry the access token after "#", and it must never leave the
 * browser.
 */
function stripFragment(event: BeforeSendEvent): BeforeSendEvent {
  return { ...event, url: event.url.split("#")[0] };
}

export function CookielessAnalytics() {
  return <Analytics beforeSend={stripFragment} />;
}
