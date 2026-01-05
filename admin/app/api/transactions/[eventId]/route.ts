import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;
    const cookie = req.headers.get("cookie") || "";

    // 🔁 Backend endpoint (already exists in your backend)
    const backendRes = await fetch(
      `${origin}/api/events/${eventId}/transactions`,
      {
        method: "GET",
        headers: { cookie },
        cache: "no-store",
      }
    );

    if (!backendRes.ok) {
      const text = await backendRes.text().catch(() => "");
      console.error(
        "❌ Backend event transactions error:",
        backendRes.status,
        text
      );

      return NextResponse.json(
        { success: false, message: "Failed to fetch event transactions" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    // ✅ Return backend response AS-IS
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ EVENT TRANSACTIONS API ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
