import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

/* ============================
   GET → HOST REQUESTS
============================ */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (!action) {
      return NextResponse.json({ message: "Action required" }, { status: 400 });
    }

    let endpoint = "";

    if (action === "list") {
      endpoint = `${BACKEND_URL}/api/admin/host-requests`;
    } else if (action === "single") {
      if (!id) {
        return NextResponse.json(
          { message: "Request ID required" },
          { status: 400 }
        );
      }
      endpoint = `${BACKEND_URL}/api/admin/host-requests/${id}`;
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    // ✅ CORRECT for your Next.js version
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(endpoint, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    const text = await res.text();

    if (text.startsWith("<")) {
      console.error("Backend returned HTML:", text);
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: res.status }
      );
    }

    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch (error: any) {
    console.error("HOSTS GET ERROR:", error);

    // Detect backend connection refused and return a helpful message
    const backendUrl = BACKEND_URL || "<unset>";
    const cause = error?.cause;
    if (cause && cause.code === "ECONNREFUSED") {
      console.error("Backend unreachable at:", backendUrl, "(ECONNREFUSED)");
      return NextResponse.json({ message: `Backend unreachable at ${backendUrl}` }, { status: 502 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/* ============================
   POST → APPROVE / REJECT
============================ */
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (!action || !id) {
      return NextResponse.json(
        { message: "Action and ID required" },
        { status: 400 }
      );
    }

    let endpoint = "";

    if (action === "approve") {
      endpoint = `${BACKEND_URL}/api/admin/approve-event-request/${id}`;
    } else if (action === "reject") {
      endpoint = `${BACKEND_URL}/api/admin/host-requests/reject/${id}`;
    } else {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // ✅ MUST await here too
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(endpoint, {
      method: action === "approve" ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (text.startsWith("<")) {
      console.error("Backend returned HTML:", text);
      return NextResponse.json(
        { message: "Unauthorized or invalid backend route" },
        { status: res.status }
      );
    }

    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch (error) {
    console.error("HOSTS POST ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}