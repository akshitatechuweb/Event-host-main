// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";

/* ======================================================
   GET EVENTS
====================================================== */
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 👇 Internal API path only (handled by Next.js rewrite)
    const response = await fetch("/api/event/events", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("BACKEND ERROR:", text);

      return NextResponse.json(
        { success: false, message: "Failed to fetch events" },
        { status: response.status }
      );
    }

    const data: unknown = await response.json();

    return NextResponse.json({
      success: true,
      events:
        typeof data === "object" &&
        data !== null &&
        "events" in data &&
        Array.isArray((data as { events?: unknown }).events)
          ? (data as { events: unknown[] }).events
          : [],
    });
  } catch (error: unknown) {
    console.error("API EVENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/* ======================================================
   CREATE EVENT
====================================================== */
export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    // 👇 Internal API path only (handled by Next.js rewrite)
    const response = await fetch("/api/event/create-event", {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
      },
      body: formData,
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("BACKEND ERROR:", text);

      return NextResponse.json(
        { success: false, message: "Failed to create event" },
        { status: response.status }
      );
    }

    const data: unknown = await response.json();

    return NextResponse.json({
      success: true,
      event:
        typeof data === "object" &&
        data !== null &&
        "event" in data
          ? (data as { event?: unknown }).event
          : data,
    });
  } catch (error: unknown) {
    console.error("CREATE EVENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
