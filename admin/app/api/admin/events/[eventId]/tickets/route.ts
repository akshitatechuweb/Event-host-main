import { NextRequest, NextResponse } from "next/server";
import { proxyFetch, API_BASE_URL, safeJson } from "@/lib/backend";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  try {
    const url = `${API_BASE_URL}/api/event/update-event/${eventId}`;

    const res = await proxyFetch(url, req, { method: "PUT" });

    const { ok, status, data, text } = await safeJson(res);

    return NextResponse.json(data || { success: false, message: text }, { status });
  } catch (error) {
    console.error("Update event proxy failed:", error);
    return NextResponse.json(
      { success: false, message: "Update event failed" },
      { status: 500 }
    );
  }
}