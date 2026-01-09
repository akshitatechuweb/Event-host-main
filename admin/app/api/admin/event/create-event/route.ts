import { NextRequest, NextResponse } from "next/server";
import { proxyFetch, API_BASE_URL, safeJson } from "@/lib/backend";

export async function POST(req: NextRequest) {
  try {
    const url = `${API_BASE_URL}/api/admin/event/create-event`;

    const res = await proxyFetch(url, req, { method: "POST" });
    const { ok, status, data, text } = await safeJson(res);

    return NextResponse.json(data || { success: false, message: text }, { status });
  } catch (err) {
    console.error("CREATE EVENT PROXY ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}