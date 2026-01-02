import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { success: false, message: "NEXT_PUBLIC_API_URL is not defined" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data: unknown = await res.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("AUTH ME API ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Auth check failed" },
      { status: 401 }
    );
  }
}
