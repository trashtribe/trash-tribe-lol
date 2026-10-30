import type { BrowserOptions, NodeOptions } from "@sentry/nextjs";

/** Public by design (it only lets the site send events), so it lives in code. */
export const SENTRY_DSN = "";

/**
 * Errors only, from production only, with no personal data: no IPs, user
 * info, cookies, headers, request bodies or query strings. Customers type
 * addresses and phone numbers into checkout; none of that should leave the
 * site. No tracing or session replay either.
 */
export const sentryOptions = {
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_DSN) && process.env.NEXT_PUBLIC_VERCEL_ENV === "production",
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
  tracesSampleRate: 0,
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
    databaseQueryData: false,
    stackFrameVariables: false,
  },
} satisfies BrowserOptions & NodeOptions;
