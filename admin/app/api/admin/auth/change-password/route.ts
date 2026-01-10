import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, safeJson } from "@/lib/backend";

/**
 * PUT /api/admin/auth/change-password
 */
export async function PUT(req: NextRequest) {
    try {
        const response = await adminBackendFetch("/auth/change-password", req, {
            method: "PUT",
            body: req.body,
            // @ts-ignore
            duplex: "half"
        });

        const { ok, status, data, text } = await safeJson(response);

        if (!ok) {
            return NextResponse.json({ success: false, message: text || "Backend error" }, { status });
        }

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("CHANGE PASSWORD PROXY ERROR:", error);
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}
