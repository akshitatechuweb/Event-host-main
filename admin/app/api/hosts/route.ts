import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? null;

/* ============================
   GET → HOST REQUESTS
============================ */
export async function GET(req: Request) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { success: false, message: "API base URL not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (!action) {
      return NextResponse.json(
        { message: "Action required" },
        { status: 400 }
      );
    }

    let endpoint: string;

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
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Please log in again",
        },
        { status: 401 }
      );
    }

    const res = await fetch(endpoint, {
      headers: {
        Cookie: `accessToken=${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Unauthorized: Your session may have expired. Please log in again.",
          },
          { status: 401 }
        );
      }

      if (text.startsWith("<")) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized or invalid backend route",
          },
          { status: res.status }
        );
      }

      try {
        const parsed: unknown = JSON.parse(text);
        return NextResponse.json(
          {
            success: false,
            message:
              typeof parsed === "object" &&
              parsed !== null &&
              "message" in parsed
                ? (parsed as { message?: string }).message
                : "Failed to fetch hosts",
          },
          { status: res.status }
        );
      } catch {
        return NextResponse.json(
          { success: false, message: "Failed to fetch hosts" },
          { status: res.status }
        );
      }
    }

    const parsed: unknown = JSON.parse(text);
    return NextResponse.json(parsed, { status: res.status });
  } catch (error: unknown) {
    console.error("HOSTS GET ERROR:", error);

    const cause = (error as { cause?: { code?: string } }).cause;
    if (cause?.code === "ECONNREFUSED") {
      return NextResponse.json(
        {
          success: false,
          message: `Backend unreachable at ${BACKEND_URL}`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* ============================
   POST → APPROVE / REJECT
============================ */
export async function POST(req: Request) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { success: false, message: "API base URL not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (!action || !id) {
      return NextResponse.json(
        { success: false, message: "Action and ID required" },
        { status: 400 }
      );
    }

    let endpoint: string;

    if (action === "approve") {
      endpoint = `${BACKEND_URL}/api/admin/approve-event-request/${id}`;
    } else if (action === "reject") {
      endpoint = `${BACKEND_URL}/api/admin/host-requests/reject/${id}`;
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    const body: unknown = await req.json().catch(() => ({}));

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Please log in again",
        },
        { status: 401 }
      );
    }

    const res = await fetch(endpoint, {
      method: action === "approve" ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      if (res.status === 401) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Unauthorized: Your session may have expired. Please log in again.",
          },
          { status: 401 }
        );
      }

      if (text.startsWith("<")) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized or invalid backend route",
          },
          { status: res.status }
        );
      }

      try {
        const parsed: unknown = JSON.parse(text);
        return NextResponse.json(
          {
            success: false,
            message:
              typeof parsed === "object" &&
              parsed !== null &&
              "message" in parsed
                ? (parsed as { message?: string }).message
                : "Failed to process request",
          },
          { status: res.status }
        );
      } catch {
        return NextResponse.json(
          { success: false, message: "Failed to process request" },
          { status: res.status }
        );
      }
    }

    const parsed: unknown = JSON.parse(text);
    return NextResponse.json(parsed, { status: res.status });
  } catch (error: unknown) {
    console.error("HOSTS POST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
