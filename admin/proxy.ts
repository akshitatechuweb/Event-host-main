import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔑 Read cookie directly (NO fetch, NO API calls)
  const token = req.cookies.get("accessToken")?.value;

  const isLoginRoute = pathname === "/login";

  const isProtectedRoute = [
    "/dashboard",
    "/events",
    "/hosts",
    "/tickets",
    "/transactions",
    "/users",
  ].some(
    (base) => pathname === base || pathname.startsWith(`${base}/`)
  );

  // 🔒 Not authenticated → protected route
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Authenticated admin visiting login → dashboard
  if (isLoginRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/events/:path*",
    "/hosts/:path*",
    "/tickets/:path*",
    "/transactions/:path*",
    "/users/:path*",
  ],
};
