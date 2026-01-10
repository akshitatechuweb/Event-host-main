import { NextRequest, NextResponse } from "next/server";
import { backendFetch, safeJson } from "@/lib/backend";
import { paginateArray } from "@/lib/pagination";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Backend route: GET /api/event/events
    const response = await backendFetch("/api/event/events", req, {
      method: "GET",
    });

    const data = await response.json();
    
    // Normalize data structure
    const allEvents = Array.isArray(data) ? data : data.events || data.data || [];
    
    // Apply server-side pagination (simulated since backend doesn't support it)
    const { items, meta } = paginateArray(allEvents, page, limit);

    return NextResponse.json({
      success: true,
      events: items,
      meta
    }, { status: response.status });

  } catch (err) {
    console.error("API EVENTS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}


