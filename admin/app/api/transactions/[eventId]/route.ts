import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
): Promise<Response> {
  const { eventId } = await context.params;

  try {
    const origin = request.nextUrl.origin;
    const cookie = request.headers.get("cookie") ?? "";

    const res = await fetch(`${origin}/api/transactions/${eventId}`, {
      headers: { cookie },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { success: false, message: text || "Failed to fetch transactions" },
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
