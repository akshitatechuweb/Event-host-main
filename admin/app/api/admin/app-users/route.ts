import { NextRequest, NextResponse } from "next/server";
import { backendFetch, safeJson } from "@/lib/backend";

/**
 * GET /api/admin/app-users
 * Returns list of all registered users
 */
export async function GET(req: NextRequest) {
    try {
        // Backend route: GET /api/user (registered in userRoutes.js)
        const response = await backendFetch("/api/user", req, {
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
