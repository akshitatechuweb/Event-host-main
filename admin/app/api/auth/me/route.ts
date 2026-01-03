// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth-utils";

export async function GET() {
  const authResult = await checkAuth();

  if (!authResult.success) {
    return NextResponse.json(
      { 
        success: false, 
        message: authResult.message || "Not authenticated" 
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user: authResult.user,
  });
}