import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Site-wide "Coming soon" gate, ahead of public launch. Everyone gets
 * rewritten to /coming-soon UNLESS they've unlocked it with the shared
 * PREVIEW_ACCESS_KEY — either just now, via `?key=...` in the URL (which
 * sets a cookie so they don't need the key again), or on a previous visit
 * (the cookie is still valid).
 *
 * /api/* is intentionally excluded (see `config.matcher` below) — webhooks
 * (Stripe, Printify) and the checkout flow are server-to-server or already
 * mid-flow, and gating them would silently break payments/fulfillment
 * without anyone visiting a page to notice.
 *
 * If PREVIEW_ACCESS_KEY isn't set, the gate is off — so forgetting to set
 * the env var fails open to the live site, not into a permanent lockout.
 */
const COOKIE_NAME = "tt_preview_ok";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function middleware(request: NextRequest) {
  const previewKey = process.env.PREVIEW_ACCESS_KEY?.trim();

  if (!previewKey) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;
  const suppliedKey = searchParams.get("key");

  if (suppliedKey && suppliedKey === previewKey) {
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

  if (request.cookies.get(COOKIE_NAME)?.value === previewKey) {
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
