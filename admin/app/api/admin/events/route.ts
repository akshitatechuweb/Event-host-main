import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, proxyFetch, backendFetch, API_BASE_URL } from "@/lib/backend";

/* ============================
      GET EVENTS (ADMIN)
===============================*/
export async function GET(req: NextRequest) {
  try {
    // Backend route: GET /api/event/events
    const response = await backendFetch("/api/event/events", req, {
      method: "GET",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("API EVENTS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ============================
     CREATE EVENT (ADMIN)
===============================*/
export async function POST(req: NextRequest) {
  try {
    const url = `${API_BASE_URL}/api/event/create-event`;

    const response = await proxyFetch(url, req, { method: "POST" });
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("CREATE EVENT ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
