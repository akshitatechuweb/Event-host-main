import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? null;

/**
 * GET /api/users
 * Fetches users list from backend
 * Supports both Bearer token (Authorization header) and cookie-based auth
 */
export async function GET(req: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { success: false, message: "API base URL not configured" },
        { status: 500 }
      );
    }

    // Try to get token from Authorization header (Bearer token)
    const authHeader = req.headers.get("authorization");
    let accessToken: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7);
    } else {
      // Fallback to cookies (for server-side compatibility)
      const cookieStore = await cookies();
      accessToken = cookieStore.get("accessToken")?.value || null;
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();

    // Forward request to backend with cookie (backend expects cookies)
    const backendUrl = `${API_BASE_URL}/api/user${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);

      return NextResponse.json(
        { 
          success: false, 
          message: response.status === 401 
            ? "Unauthorized" 
            : "Failed to fetch users" 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("API USERS ERROR:", error);

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

