// app/api/auth/action/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Parse Set-Cookie header to extract cookie value
 * Handles various formats: "accessToken=value; Path=/; HttpOnly" or "accessToken=value"
 */
function parseCookieValue(setCookieHeader: string): string | null {
  // Format: "accessToken=value; Path=/; HttpOnly; Secure; SameSite=None"
  // Or: "accessToken=value; Domain=.example.com; Path=/; HttpOnly; Secure; SameSite=None"
  const match = setCookieHeader.match(/^accessToken=([^;]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

export async function POST(req: Request) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { message: "NEXT_PUBLIC_API_URL is not defined" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    if (!action) {
      return NextResponse.json(
        { message: "Action required" },
        { status: 400 }
      );
    }

    let backendRes: Response;

    if (action === "request-otp") {
      backendRes = await fetch(`${BACKEND_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else if (action === "verify-otp") {
      backendRes = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      );
    }

    const data = await backendRes.json();

    // Create response with correct status
    const response = NextResponse.json(data, { status: backendRes.status });

    // For verify-otp, we need to set the cookie on the Next.js domain
    // Extract token from backend's Set-Cookie and set it with correct attributes
    if (action === "verify-otp" && backendRes.status === 200 && data.success) {
      const setCookieHeaders = backendRes.headers.getSetCookie?.() || [];
      let tokenValue: string | null = null;
      
      // Try to extract token from Set-Cookie headers
      for (const setCookieHeader of setCookieHeaders) {
        const parsed = parseCookieValue(setCookieHeader);
        if (parsed) {
          tokenValue = parsed;
          break;
        }
      }
      
      // If we couldn't extract from Set-Cookie, log a warning
      // The backend should always set the cookie, so this shouldn't happen
      if (!tokenValue) {
        console.warn("⚠️  No accessToken found in Set-Cookie headers from backend");
        console.warn("Set-Cookie headers:", setCookieHeaders);
      } else {
        // Set cookie on Next.js domain with production-safe attributes
        const isProd = process.env.NODE_ENV === "production";
        
        response.cookies.set("accessToken", tokenValue, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        });
        
        console.log("✅ Cookie set on Next.js domain successfully");
      }
    }

    return response;
  } catch (error: unknown) {
    console.error("AUTH OTP API ERROR:", error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}