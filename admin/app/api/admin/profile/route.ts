import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, safeJson } from "@/lib/backend";

/**
 * GET /api/admin/profile
 */
export async function GET(req: NextRequest) {
    try {
        const response = await adminBackendFetch("/profile", req, { method: "GET" });
        const { ok, status, data, text } = await safeJson(response);

        if (!ok) {
            return NextResponse.json({ success: false, message: text || "Backend error" }, { status });
        }

        return NextResponse.json(data, { status });
    } catch (error) {
        console.error("PROFILE PROXY ERROR (GET):", error);
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}

/**
 * PUT /api/admin/profile
 */
export async function PUT(req: NextRequest) {
    try {
        const response = await adminBackendFetch("/profile", req, {
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
        console.error("PROFILE PROXY ERROR (PUT):", error);
        return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
    }
}
