import { NextRequest, NextResponse } from "next/server";

/* ============================
   GET TRANSACTIONS (ADMIN)
===============================*/
export async function GET(req: NextRequest) {
  try {
    const eventId = req.nextUrl.searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "eventId is required" },
        { status: 400 }
      );
    }

    // ✅ SAME-ORIGIN ONLY (rewrite handles backend)
    const response = await fetch(
      `${req.nextUrl.origin}/api/booking/admin?eventId=${eventId}`,
      {
        method: "GET",
        headers: {
          cookie: req.headers.get("cookie") || "",
          accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: "Invalid backend response",
          details: text,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("API TRANSACTIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
