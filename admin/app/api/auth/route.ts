import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

/* =======================
   POST → OTP ACTIONS
======================= */
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (!action) {
    return NextResponse.json(
      { message: "Action is required" },
      { status: 400 }
    );
  }

  const body = await req.json();

  /* ---- REQUEST OTP ---- */
  if (action === "request-otp") {
    const res = await fetch(`${BACKEND_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  /* ---- VERIFY OTP ---- */
  if (action === "verify-otp") {
    const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    // Forward cookie
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
}

/* =======================
   GET → AUTH CHECK
======================= */
export async function GET() {
  const cookieStore = cookies();

  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json(data);
}

/* =======================
   DELETE → LOGOUT
======================= */
export async function DELETE() {
  const res = await fetch(`${BACKEND_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  const response = NextResponse.json({ success: true });

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
