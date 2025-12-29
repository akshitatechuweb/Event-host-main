// app/api/events/[eventId]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    // ✅ FIX: await params
    const { eventId } = await context.params;

    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const backendUrl = `${API_BASE_URL}/api/event/delete-event/${eventId}`;
    console.log("CALLING BACKEND:", backendUrl);

    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers: {
        Cookie: cookieHeader, // forward auth cookie
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("BACKEND ERROR:", text);

      return NextResponse.json(
        { success: false, message: "Failed to delete event" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: data.message || "Event deleted successfully",
    });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params;

    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Read incoming FormData and forward it
    const formData = await req.formData();

    const backendUrl = `${API_BASE_URL}/api/event/update-event/${eventId}`;
    console.log("CALLING BACKEND (update):", backendUrl);

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Cookie: cookieHeader,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("BACKEND ERROR:", text);

      return NextResponse.json(
        { success: false, message: "Failed to update event" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, event: data.event });
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
