import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Gates every /admin/* page and /api/admin/* route behind a single shared
 * password (ADMIN_PANEL_PASSWORD) — this is a solo-owner internal tool
 * (hide/show a product on trashtribe.lol without touching Printify), not a
 * multi-user system, so a shared-secret cookie is enough; no need for a
 * full user/role model for one person.
 *
 * /admin/login and its POST target /api/admin/login are excluded here
 * since that's the only way to ever get the cookie in the first place.
 */
const ADMIN_COOKIE_NAME = "tt_admin_key";
const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/admin/login"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_PANEL_PASSWORD;
  const provided = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!expected || provided !== expected) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
