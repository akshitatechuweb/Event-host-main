import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch } from "@/lib/backend";

/**
 * OPTION B — Admin Hosts API
 * Works in local + production
 * No env vars
 * Same-origin backend proxy via /api/admin.
 */

/* ============================
   GET → HOST REQUESTS
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

    const { searchParams } = req.nextUrl;
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (!action) {
      return NextResponse.json(
        { message: "Action required" },
        { status: 400 }
      );
    }

    let path: string;

    if (action === "list") {
      path = "/host-requests";
    } else if (action === "single") {
      if (!id) {
        return NextResponse.json(
          { message: "Request ID required" },
          { status: 400 }
        );
      }
      path = `/host-requests/${id}`;
    } else {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      );
    }

    const backendRes = await adminBackendFetch(path, req, { method: "GET" });

    if (!backendRes.ok) {
      const text = await backendRes.text().catch(() => "");
      console.error("❌ Hosts GET error:", backendRes.status, text);

      return NextResponse.json(
        { success: false, message: "Failed to fetch hosts" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ HOSTS GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ============================
   POST → APPROVE / REJECT
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

    const { searchParams } = req.nextUrl;
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (!action || !id) {
      return NextResponse.json(
        { success: false, message: "Action and ID required" },
        { status: 400 }
      );
    }

    let path: string;
    let method: "POST" | "PUT" = "POST";

    if (action === "approve") {
      path = `/approve-event-request/${id}`;
      method = "PUT";
    } else if (action === "reject") {
      path = `/host-requests/reject/${id}`;
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const backendRes = await adminBackendFetch(path, req, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      const text = await backendRes.text().catch(() => "");
      console.error("❌ Hosts POST error:", backendRes.status, text);

      return NextResponse.json(
        { success: false, message: "Failed to process request" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ HOSTS POST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
