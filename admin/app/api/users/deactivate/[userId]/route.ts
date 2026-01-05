import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const cookie = req.headers.get("cookie") || "";

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "User ID required" },
        { status: 400 }
      );
    }

    const backendRes = await fetch(
      `${origin}/api/user/deactivate/${userId}`,
      {
        method: "PUT",
        headers: { cookie },
        cache: "no-store",
      }
    );

    if (!backendRes.ok) {
      const text = await backendRes.text().catch(() => "");
      console.error("❌ Deactivate user error:", text);

      return NextResponse.json(
        { message: "Failed to deactivate user" },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ DEACTIVATE USER API ERROR:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
