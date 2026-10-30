import type { BrowserOptions, NodeOptions } from "@sentry/nextjs";

/** Public by design (it only lets the site send events), so it lives in code. */
export const SENTRY_DSN =
  "https://2114b4aed39ec24e859b3bba1ed9e650@o4512347849031680.ingest.de.sentry.io/4512347891368016";

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
