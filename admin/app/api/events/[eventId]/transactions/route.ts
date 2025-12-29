import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * GET /api/admin/events/:eventId/transactions
 * Proxies admin-authenticated request to backend
 */
export async function GET(
  req: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const { eventId } = context.params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
      );
    }

    // Forward cookies for auth (JWT in cookies)
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendUrl = `${API_BASE_URL}/api/admin/events/${eventId}/transactions`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        Accept: "application/json",
      },
      cache: "no-store", // always fresh data
    });

    const text = await response.text();

    if (!response.ok) {
      console.error(
        "BACKEND TRANSACTIONS ERROR:",
        response.status,
        text
      );

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch transactions",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(JSON.parse(text), {
      status: response.status,
    });
  } catch (error) {
    console.error("TRANSACTIONS ROUTE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
