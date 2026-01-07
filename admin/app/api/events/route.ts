import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/backend";

/* ============================
      GET EVENTS (ADMIN)
===============================*/
export async function GET(req: NextRequest) {
  try {
    // Backend route: GET /api/admin/events
    const response = await adminBackendFetch("/events", req, {
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
    const formData = await req.formData();

    // Backend route: POST /api/admin/create-event
    const response = await adminBackendFetch("/create-event", req, {
      method: "POST",
      body: formData,
    });

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
