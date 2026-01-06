import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { message: "eventId is required" },
      { status: 400 }
    );
  }

  // 🔒 SAME ORIGIN — no env vars, no hardcoding
  const origin = req.nextUrl.origin;

  // 🍪 Forward HTTP-only cookies
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const backendRes = await fetch(
    `${origin}/api/booking/admin?eventId=${eventId}`,
    {
      method: "GET",
      headers: {
        cookie: cookieHeader,
        accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const rawText = await backendRes.text();

  try {
    return NextResponse.json(JSON.parse(rawText), {
      status: backendRes.status,
    });
  } catch {
    return NextResponse.json(
      {
        message: "Backend returned non-JSON",
        raw: rawText,
      },
      { status: 502 }
    );
  }
}
