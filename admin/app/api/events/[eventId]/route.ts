import { NextRequest, NextResponse } from "next/server";

// Local helper modeled after your working version, but more robust
async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    return {
      ok: false,
      status: res.status,
      body: {
        success: false,
        message: text || "Non-JSON response",
      },
    };
  }

  return {
    ok: res.ok,
    status: res.status,
    body: await res.json(),
  };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  try {
    const cookie = req.headers.get("cookie") ?? "";

    // Prefer env-driven backend base URL, with hardcoded fallback for safety
    const baseUrl =
      (process.env.NEXT_PUBLIC_API_URL || "https://api.unrealvibe.com").replace(
        /\/+$/,
        ""
      );

    const res = await fetch(
      `${baseUrl}/api/event/update-event/${eventId}`,
      {
        method: "PUT",
        headers: { cookie },
        body: req.body,
        cache: "no-store",
      }
    );

    const out = await safeJson(res);
    return NextResponse.json(out.body, { status: out.status });
  } catch (error) {
    console.error("Update event proxy failed:", error);
    return NextResponse.json(
      { success: false, message: "Update event failed" },
      { status: 500 }
    );
  }
}
