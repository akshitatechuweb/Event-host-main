// app/api/events/[eventId]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
      );
    }

    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 👇 Internal API path only (rewrite handles backend)
    const response = await fetch(
      `/api/event/delete-event/${eventId}`,
      {
        method: "DELETE",
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("BACKEND ERROR:", text);

      return NextResponse.json(
        { success: false, message: "Failed to delete event" },
        { status: response.status }
      );
    }

    const data: unknown = await response.json();

    return NextResponse.json({
      success: true,
      message:
        typeof data === "object" &&
        data !== null &&
        "message" in data
          ? (data as { message?: string }).message
          : "Event deleted successfully",
    });
  } catch (error: unknown) {
    console.error("DELETE EVENT ERROR:", error);

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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, message: "Event ID is required" },
        { status: 400 }
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

    // 👇 Internal API path only (rewrite handles backend)
    const response = await fetch(
      `/api/event/update-event/${eventId}`,
      {
        method: "PUT",
        headers: {
          Cookie: cookieHeader,
        },
        body: formData,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("BACKEND ERROR:", text);

      return NextResponse.json(
        { success: false, message: "Failed to update event" },
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
    console.error("UPDATE EVENT ERROR:", error);

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
