// app/api/auth/action/route.ts
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

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

    // Properly forward ALL set-cookie headers (can be multiple!)
    const setCookieHeaders = backendRes.headers.getSetCookie?.() || [];
    setCookieHeaders.forEach((cookie) => {
      response.headers.append("set-cookie", cookie);
    });

    return response;
  } catch (error: unknown) {
    console.error("AUTH OTP API ERROR:", error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}