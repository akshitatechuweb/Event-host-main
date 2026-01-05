import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const IS_PROD = process.env.NODE_ENV === "production";

async function isAdminAuthenticated(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("accessToken")?.value;

  if (!token || !API_BASE_URL) {
    return false;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return false;
    }

    const data = await res.json().catch(() => null);

    return Boolean(
      data &&
        data.success &&
        (data.role === "admin" || data.role === "superadmin")
    );
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  // In development (localhost), do not enforce auth here.
  // The deployed admin (under *.unrealvibe.com) will run with NODE_ENV=production
  // and will use the full backend-validated auth flow below.
  if (!IS_PROD) {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  const isLoginRoute = pathname === "/login";
  const isProtectedRoute = [
    "/dashboard",
    "/events",
    "/hosts",
    "/tickets",
    "/transactions",
    "/users",
  ].some((base) => pathname === base || pathname.startsWith(`${base}/`));

  const authenticated = await isAdminAuthenticated(req);

  // Unauthenticated → protected route → go to login
  if (isProtectedRoute && !authenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated admin visiting /login → send to dashboard
  if (isLoginRoute && authenticated) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
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
