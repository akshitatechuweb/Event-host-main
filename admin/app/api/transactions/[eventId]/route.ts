import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
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

    // ✅ MUST use absolute URL inside route handlers
    const origin = request.nextUrl.origin;
    const cookie = request.headers.get("cookie") ?? "";

    const res = await fetch(
      `${origin}/api/booking/admin?eventId=${eventId}`,
      {
        headers: {
          Cookie: cookie,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          success: false,
          message: text || "Failed to fetch transactions",
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("TRANSACTIONS API ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
