// app/api/events/[eventId]/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

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

    // 👇 IMPORTANT: Internal API path ONLY
    // Rewrite will proxy this to:
    // https://api.unrealvibe.com/api/admin/events/:eventId/transactions
    const response = await fetch(
      `/api/admin/events/${eventId}/transactions`,
      {
        method: "GET",
        headers: {
          Cookie: cookieHeader,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

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

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text; // fallback if not JSON
    }

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
