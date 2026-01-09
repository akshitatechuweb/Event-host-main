import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/backend";


/* ============================
   GET → LIST / SINGLE
============================ */
export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";
    if (!cookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = req.nextUrl.searchParams.get("id");

    const path = id
      ? `/admin/host-requests/${id}`
      : `/admin/host-requests`;

    const backendRes = await adminBackendFetch(path, req, { method: "GET" });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("HOST REQUESTS GET ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ============================
   PUT → APPROVE HOST
============================ */
export async function PUT(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";
    if (!cookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Host request ID required" },
        { status: 400 }
      );
    }

    const backendRes = await adminBackendFetch(
      `/admin/approve-event-request/${id}`,
      req,
      { method: "PUT" }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("APPROVE HOST ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ============================
   POST → REJECT HOST
============================ */
export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";
    if (!cookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Host request ID required" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const backendRes = await adminBackendFetch(
      `/admin/host-requests/reject/${id}`,
      req,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("REJECT HOST ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
