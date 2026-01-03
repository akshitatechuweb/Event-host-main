import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}` : null;

export async function POST() {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { success: false, message: "NEXT_PUBLIC_API_BASE_URL is not defined" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    // Call backend logout to allow any server-side session cleanup.
    // BACKEND_URL already includes /api, so use /auth/logout
    if (accessToken) {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `accessToken=${accessToken}`,
        },
        cache: "no-store",
      });
    }

    // Clear the cookie on the Next.js/admin domain. Attributes must match
    // what the backend uses when issuing the cookie.
    const isProd = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    response.cookies.set("accessToken", "", {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("AUTH LOGOUT API ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 }
    );
  }
}
