import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, safeJson } from "@/lib/backend";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  try {
    // Backend route: PUT /api/admin/event/update-event/:eventId
    const res = await adminBackendFetch(`/event/update-event/${eventId}`, req, {
      method: "PUT",
      body: req.body,
      // @ts-ignore
      duplex: "half",
    });

    const { status, data, text } = await safeJson(res);

    return NextResponse.json(data || { success: false, message: text }, { status });
  } catch (err) {
    console.error("UPDATE EVENT PROXY ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}