import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/auth/token
 * Returns the access token from cookies (for client-side use)
 * Note: This endpoint should only be used when Bearer token auth is required
 * The token is already available in httpOnly cookies for server-side use
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "No token found" },
        { status: 401 }
      );
    }

    // Return token (note: in production, consider if this is secure enough)
    // Alternative: Use the token server-side and don't expose it to client
    return NextResponse.json({
      success: true,
      token: accessToken,
    });
  } catch (error) {
    console.error("Token API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get token" },
      { status: 500 }
    );
  }
}

