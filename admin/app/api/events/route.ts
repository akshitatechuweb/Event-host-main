import { NextRequest, NextResponse } from "next/server";

/* ============================
      GET EVENTS (ADMIN)
===============================*/
export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || req.nextUrl.origin;

    const response = await fetch(
      `${baseUrl}/api/admin/events`,
      {
        method: "GET",
        headers: { Cookie: cookie },
        credentials: "include",
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("API EVENTS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ============================
     CREATE EVENT (ADMIN)
===============================*/
export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || req.nextUrl.origin;

    const formData = await req.formData();

    const response = await fetch(
      `${baseUrl}/api/admin/create-event`,
      {
        method: "POST",
        headers: { Cookie: cookie },
        body: formData,
        credentials: "include",
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    console.error("CREATE EVENT ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}