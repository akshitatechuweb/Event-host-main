import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await context.params;

    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = `${API_BASE_URL}/api/admin/events/${eventId}/transactions`;
    console.log("CALLING BACKEND (transactions):", backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("BACKEND ERROR (transactions):", text);
      return NextResponse.json({ success: false, message: "Failed to fetch transactions" }, { status: response.status });
    }

    return NextResponse.json(JSON.parse(text), { status: response.status });
  } catch (error) {
    console.error("GET EVENT TRANSACTIONS ERROR:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
