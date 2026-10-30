import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Site-wide "Coming soon" gate. When COMING_SOON_ENABLED is true, every page
 * is rewritten to /coming-soon. No key or env var is needed.
 *
 * Optional bypass: if PREVIEW_ACCESS_KEY is set in Vercel, visiting any page
 * with `?key=...` sets a cookie that skips the gate for 30 days. Without the
 * env var there is no bypass at all.
 *
 * /api/* is intentionally excluded (see `config.matcher` below) — webhooks
 * (Stripe, Printify) and the checkout flow are server-to-server or already
 * mid-flow, and gating them would silently break payments/fulfillment
 * without anyone visiting a page to notice.
 *
 * Named/filed as `proxy.ts`, not `middleware.ts` — this Next.js version
 * renamed the "middleware" file convention to "proxy"
 * (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 */
const COOKIE_NAME = "tt_preview_ok";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Master switch. true = coming soon is active; false = the site is fully open.
 * To open or close the site: change this one line and push.
 */
const COMING_SOON_ENABLED = false;

export function proxy(request: NextRequest) {
  if (!COMING_SOON_ENABLED) {
    return NextResponse.next();
  }

  const previewKey = process.env.PREVIEW_ACCESS_KEY?.trim();
  const { pathname, searchParams } = request.nextUrl;
  const suppliedKey = searchParams.get("key");

  if (previewKey && suppliedKey === previewKey) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("key");
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(COOKIE_NAME, previewKey, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return response;
  }

  if (previewKey && request.cookies.get(COOKIE_NAME)?.value === previewKey) {
    return NextResponse.next();
  }

  // Avoid rewriting /coming-soon to itself.
  if (pathname === "/coming-soon") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/coming-soon";
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
