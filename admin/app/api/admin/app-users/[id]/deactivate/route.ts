import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, safeJson } from "@/lib/backend";

/**
 * PUT /api/admin/app-users/[id]/deactivate
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Backend route: PUT /api/admin/app-users/deactivate/:id
        const response = await adminBackendFetch(`/app-users/deactivate/${id}`, req, {
            method: "PUT",
        });

        const { ok, status, data, text } = await safeJson(response);

        if (!ok) {
            return NextResponse.json(
                { success: false, message: text || "Failed to deactivate user" },
                { status }
            );
        }

        return NextResponse.json(data, { status });
    } catch (err) {
        console.error("API DEACTIVATE ERROR:", err);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
