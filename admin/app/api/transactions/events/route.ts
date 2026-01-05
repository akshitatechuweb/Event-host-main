import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const cookie = req.headers.get("cookie") || "";

    const backendRes = await fetch(`${origin}/api/event/events`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    if (!backendRes.ok) {
      const text = await backendRes.text().catch(() => "");
      console.error(
        "❌ Backend events fetch error:",
        backendRes.status,
        text
      );

      return NextResponse.json(
        { message: "Failed to fetch events" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ TRANSACTIONS EVENTS API ERROR:", err);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
