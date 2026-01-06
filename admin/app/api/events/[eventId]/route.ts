import { NextRequest, NextResponse } from "next/server";

async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    return {
      ok: false,
      status: res.status,
      body: { success: false, message: text || "Non-JSON response" },
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

    const res = await fetch(
      `https://api.unrealvibe.com/api/event/update-event/${eventId}`,
      {
        method: "PUT",
        headers: { cookie },
        body: req.body,
        cache: "no-store",
      }
    );

    const out = await safeJson(res);
    return NextResponse.json(out.body, { status: out.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Update event failed" },
      { status: 500 }
    );
  }
}
