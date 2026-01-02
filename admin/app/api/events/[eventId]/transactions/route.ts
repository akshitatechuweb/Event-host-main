import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? null;

/**
 * GET /api/events/:eventId/transactions
 * Proxies admin-authenticated request to backend
 */
export async function GET(
  req: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { success: false, message: "API base URL not configured" },
        { status: 500 }
      );
    }

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
      cache: "no-store",
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

    const parsed: unknown = JSON.parse(text);
    return NextResponse.json(parsed, {
      status: response.status,
    });
  } catch (error: unknown) {
    console.error("TRANSACTIONS ROUTE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
