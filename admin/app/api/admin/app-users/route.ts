import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, safeJson } from "@/lib/backend";

/**
 * GET /api/admin/app-users
 * Returns list of all registered users
 */
export async function GET(req: NextRequest) {
    try {
        // Backend route: GET /api/admin/app-users
        const response = await adminBackendFetch("/app-users", req, {
            method: "GET",
        });

        const { ok, status, data, text } = await safeJson(response);

        if (!ok) {
            return NextResponse.json(
                { success: false, message: text || "Failed to fetch users" },
                { status }
            );
        }

        return NextResponse.json(data, { status });
    } catch (err) {
        console.error("API APP USERS ERROR:", err);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
