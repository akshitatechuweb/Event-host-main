import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const body = await req.json();

  if (!action) {
    return NextResponse.json({ message: "Action required" }, { status: 400 });
  }

  if (action === "request-otp") {
    const res = await fetch(`${BACKEND_URL}/api/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json(await res.json(), { status: res.status });
  }

  if (action === "verify-otp") {
    const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const response = NextResponse.json(await res.json(), {
      status: res.status,
    });

    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  }

  return NextResponse.json({ message: "Invalid action" }, { status: 400 });
}
