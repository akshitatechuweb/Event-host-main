import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, safeJson } from "@/lib/backend";
import { paginateArray } from "@/lib/pagination";

/**
 * GET /api/admin/app-users
 * Returns list of all registered users
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        // Backend route: GET /api/admin/app-users
        const response = await adminBackendFetch("/app-users", req, {
            method: "GET",
        });

        const { ok, status, data, text } = await safeJson(response);

        if (!ok) {
            // Log truncated non-JSON responses to help diagnose auth/HTML redirects in production.
            console.warn("Non-JSON response from backend /app-users:", (text || "").slice(0, 200));
            return NextResponse.json(
                { success: false, message: text || "Failed to fetch users" },
                { status }
            );
        }

        const allUsers = Array.isArray(data) ? data : ((data as any)?.users ?? []);
        const { items, meta } = paginateArray(allUsers, page, limit);

        return NextResponse.json({
            success: true,
            users: items,
            meta
        }, { status });

    } catch (err) {
        console.error("API APP USERS ERROR:", err);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
