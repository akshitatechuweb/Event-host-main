import { NextRequest, NextResponse } from "next/server";
import { proxyFetch, API_BASE_URL, safeJson } from "@/lib/backend";

/**
 * GET /api/admin/events/[eventId]/tickets
 * Proxy to backend: GET /api/passes/:eventId
 */
export const GET = handle;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  try {
    const url = `${API_BASE_URL}/api/passes/${eventId}`;

    const res = await proxyFetch(url, req, { method: "POST" });

    const { ok, status, data, text } = await safeJson(res);

    if (!ok) {
      return NextResponse.json(
        {
          success: false,
          message: text || "Failed to create ticket on backend",
        },
        { status }
      );
    }

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("Create event ticket proxy failed:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handle(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  try {
    const url = `${API_BASE_URL}/api/passes/${eventId}`;

    const res = await proxyFetch(url, req, { method: "GET" });

    const { ok, status, data, text } = await safeJson(res);

    if (!ok) {
      return NextResponse.json(
        {
          success: false,
          message: text || "Failed to fetch tickets from backend",
        },
        { status }
      );
    }

    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("Fetch event tickets proxy failed:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}