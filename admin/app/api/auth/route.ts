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

    const body: unknown = await req.json();

    if (!action) {
      return NextResponse.json(
        { message: "Action required" },
        { status: 400 }
      );
    }

    if (action === "request-otp") {
      const res = await fetch(`${BACKEND_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: unknown = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    if (action === "verify-otp") {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data: unknown = await res.json();
      const response = NextResponse.json(data, {
        status: res.status,
      });

      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        response.headers.set("set-cookie", setCookie);
      }

      return response;
    }

    return NextResponse.json(
      { message: "Invalid action" },
      { status: 400 }
    );
  } catch (error: unknown) {
    console.error("AUTH OTP API ERROR:", error);

    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}
