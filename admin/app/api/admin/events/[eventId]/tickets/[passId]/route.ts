import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, safeJson } from "@/lib/backend";

/**
 * GET /api/admin/events/[eventId]/tickets
 * Proxy to backend: GET /api/admin/events/:eventId/tickets
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  try {
    const response = await adminBackendFetch(`/events/${eventId}/tickets`, req, {
      method: "GET",
    });

    const { ok, status, data, text } = await safeJson(response);

    if (!ok) {
      return NextResponse.json(
        { success: false, message: text || "Failed to fetch tickets from backend" },
        { status }
      );
    }

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("❌ EVENT TICKETS API PROXY ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}