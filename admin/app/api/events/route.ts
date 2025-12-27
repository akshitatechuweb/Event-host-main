// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

    // 🔑 ADMIN EVENTS ENDPOINT (THIS IS THE FIX)
    const backendUrl = `${API_BASE_URL}/api/event/events`;
    console.log("CALLING BACKEND:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("BACKEND ERROR:", text);

      return NextResponse.json(
        { success: false, message: "Failed to fetch events" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      events: data.events || [],
    });
  } catch (error) {
    console.error("API EVENTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
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

    const backendUrl = `${API_BASE_URL}/api/event/create-event`;
    console.log("CALLING BACKEND:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Cookie: cookieHeader, // 🔑 SAME FIX
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("BACKEND ERROR:", text);

      return NextResponse.json(
        { success: false, message: "Failed to create event" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      event: data.event,
    });
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
