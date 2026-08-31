import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "tt_admin_key";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin/products");
  const safeNext = next.startsWith("/admin") ? next : "/admin/products";

  const expected = process.env.ADMIN_PANEL_PASSWORD;

  if (!expected || password !== expected) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", safeNext);
    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(safeNext, request.url), { status: 303 });
  response.cookies.set(ADMIN_COOKIE_NAME, password, {
    httpOnly: true,
    // Plain HTTP in local dev (npm run dev on http://localhost) can't set a
    // Secure cookie — the browser silently drops it — so only require it in
    // production, where the site is always served over HTTPS.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  return response;
}
