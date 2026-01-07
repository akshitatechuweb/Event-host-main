import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, safeJson } from "@/lib/backend";

/* ============================
   GET TRANSACTIONS (ADMIN)
===============================*/
export async function GET(req: NextRequest) {
  try {
    const eventId = req.nextUrl.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "eventId is required" },
        { status: 400 }
      );
    }

    // Backend route: GET /api/admin/events/:eventId/transactions
    const response = await adminBackendFetch(
      `/events/${eventId}/transactions`,
      req,
      {
        method: "GET",
      }
    );

    const { ok, status, data, text } = await safeJson<{
      transactions?: unknown[];
      totals?: {
        totalRevenue?: number;
        totalTransactions?: number;
        totalTickets?: number;
      };
    }>(response);

    if (!ok || !data) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid backend response",
          details: text,
        },
        { status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        transactions: data.transactions || [],
        totals: data.totals || {
          totalRevenue: 0,
          totalTransactions: 0,
          totalTickets: 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API TRANSACTIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
