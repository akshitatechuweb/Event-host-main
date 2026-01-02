// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? null;

/* ======================================================
   GET EVENTS
====================================================== */
export async function GET(_req: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { success: false, message: "API base URL not configured" },
        { status: 500 }
      );
    }

    const cookieHeader = _req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendUrl = `${API_BASE_URL}/api/event/events`;
    console.log("CALLING BACKEND:", backendUrl);

    const response = await fetch(backendUrl, {
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
    if (!API_BASE_URL) {
      return NextResponse.json(
        { success: false, message: "API base URL not configured" },
        { status: 500 }
      );
    }

    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await req.formData();

    const backendUrl = `${API_BASE_URL}/api/event/create-event`;
    console.log("CALLING BACKEND:", backendUrl);

    const response = await fetch(backendUrl, {
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
