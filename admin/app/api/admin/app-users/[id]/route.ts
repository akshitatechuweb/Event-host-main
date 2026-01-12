import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, safeJson } from "@/lib/backend";

// GET /api/admin/app-users/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const backendRes = await adminBackendFetch(`/app-users/${id}`, req, { method: "GET" });
    const parsed = await safeJson(backendRes);

    if (!parsed.ok) {
      return NextResponse.json({ success: false, message: parsed.text || "Failed to fetch user" }, { status: parsed.status });
    }

    const parsedData: unknown = parsed.data;
    let userObj: unknown | null = null;

    if (parsedData && typeof parsedData === "object" && "user" in parsedData) {
      // parsed.data has shape { user: {...} }
      userObj = (parsedData as { user: unknown }).user;
    } else {
      userObj = parsedData || null;
    }

    if (!userObj) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: userObj }, { status: parsed.status });
  } catch (err) {
    console.error("API GET APP USER ERROR:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}