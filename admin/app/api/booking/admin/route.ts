import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Use a separate env variable for server-side API calls
const API_BASE_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");

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
        "Cookie": `accessToken=${accessToken.value}`,
        "Content-Type": "application/json",
      },
      credentials: "include", // This helps with cookie forwarding
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Booking admin error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: `${API_BASE_URL}/api/booking/admin`
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Failed to fetch bookings: ${response.statusText}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Booking admin API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        stack: process.env.NODE_ENV === "development" ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}