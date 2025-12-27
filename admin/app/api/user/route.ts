// app/api/user/route.ts
// ✅ MOVED FROM: app/api/users/route.ts
// ✅ NEW PATH: app/api/user/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");

    // Build the backend URL
    const queryString = searchParams.toString();
    // ✅ CHANGED: /api/users → /api/user
    const backendUrl = `${BACKEND_URL}/api/user${queryString ? `?${queryString}` : ""}`;
    
    console.log("🔄 Proxying to:", backendUrl);
    console.log("🍪 Access Token:", accessToken?.value ? "Present" : "Missing");

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken?.value && { Cookie: `accessToken=${accessToken.value}` }),
      },
    });

    console.log("📡 Backend response status:", res.status);

    // Check if response is JSON
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await res.text();
      console.error("❌ Backend returned non-JSON:", text.substring(0, 200));
      return NextResponse.json(
        { 
          success: false,
          message: "Backend returned invalid response",
          details: text.substring(0, 200)
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    console.log("✅ Users fetched:", data.total || 0);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch users" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Users API error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}