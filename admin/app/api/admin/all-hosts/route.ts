import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, safeJson } from "@/lib/backend";

/**
 * GET /api/admin/all-hosts
 * Returns list of all approved hosts
 */
export async function GET(req: NextRequest) {
    try {
        const response = await adminBackendFetch("/all-hosts", req, {
            method: "GET",
        });

        const { ok, status, data, text } = await safeJson(response);

        if (!ok) {
            return NextResponse.json(
                { success: false, message: text || "Failed to fetch hosts" },
                { status }
            );
        }

        return NextResponse.json(data, { status });
    } catch (err) {
        console.error("API ALL HOSTS ERROR:", err);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
