import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Resolve API base URL safely
const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  null;

export async function GET(req: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { success: false, message: "API base URL is not configured" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No access token" },
        { status: 401 }
      );
    }

    console.log("Fetching from:", `${API_BASE_URL}/api/booking/admin`);

    const response = await fetch(`${API_BASE_URL}/api/booking/admin`, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${accessToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Booking admin error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: `${API_BASE_URL}/api/booking/admin`,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Failed to fetch bookings: ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data: unknown = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Booking admin API error:", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    const stack =
      error instanceof Error && process.env.NODE_ENV === "development"
        ? error.stack
        : undefined;

    return NextResponse.json(
      {
        success: false,
        message,
        stack,
      },
      { status: 500 }
    );
  }
}
