import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // 🔑 Always derive origin dynamically (works in local + prod)
    const origin = req.nextUrl.origin;

    // 🔐 Forward cookies for auth (admin accessToken)
    const cookie = req.headers.get("cookie") || "";

    /**
     * 🔁 Backend endpoint
     * Make sure this matches your Express route
     * Example backend route:
     *   GET /api/booking/admin
     */
    const backendRes = await fetch(`${origin}/api/booking/admin`, {
      method: "GET",
      headers: {
        cookie,
      },
      cache: "no-store",
    });

    if (!backendRes.ok) {
      const text = await backendRes.text().catch(() => "");
      console.error("❌ Backend transactions error:", backendRes.status, text);

      return NextResponse.json(
        { success: false, message: "Failed to fetch transactions" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();

    /**
     * ✅ Normalize response shape
     * Frontend should never care how backend responds
     */
    return NextResponse.json({
      success: true,
      transactions: data.bookings || data.transactions || data || [],
    });
  } catch (error) {
    console.error("❌ TRANSACTIONS API ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
