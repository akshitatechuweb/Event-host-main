import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/backend";

/**
 * Dashboard stats endpoint - proxies to backend controller
 * Backend handles all the aggregation logic from Event, User, Transaction, and Booking models
 */
export async function GET(req: NextRequest) {
  try {
    // Simply proxy to the backend controller which handles everything
    const res = await adminBackendFetch("/dashboard/stats", req);
    const data = await res.json();

    // Return the data from backend as-is
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard stats error:", error);

    // Return safe fallback data if backend fails
    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: 0,
        totalEvents: 0,
        totalUsers: 0,
        totalTransactions: 0,
      },
      recentEvents: [],
      recentTransactions: [],
      meta: {
        eventsOk: false,
        bookingsOk: false,
        usersOk: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
