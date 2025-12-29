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

    // ✅ Get cookies and specifically extract accessToken
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");

    if (!accessToken) {
      console.error("❌ No accessToken cookie found");
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized: Please log in again" 
        },
        { status: 401 }
      );
    }

    // ✅ Forward only the accessToken cookie (like user route does)
    const res = await fetch(endpoint, {
      headers: {
        Cookie: `accessToken=${accessToken.value}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      console.error(`❌ Backend error (${res.status}):`, text.substring(0, 200));
      
      if (res.status === 401) {
        return NextResponse.json(
          { 
            success: false,
            message: "Unauthorized: Your session may have expired. Please log in again." 
          },
          { status: 401 }
        );
      }

      if (text.startsWith("<")) {
        console.error("Backend returned HTML:", text);
        return NextResponse.json(
          { 
            success: false,
            message: "Unauthorized or invalid backend route" 
          },
          { status: res.status }
        );
      }

      try {
        const errorData = JSON.parse(text);
        return NextResponse.json(
          { 
            success: false,
            message: errorData.message || "Failed to fetch hosts" 
          },
          { status: res.status }
        );
      } catch {
        return NextResponse.json(
          { 
            success: false,
            message: "Failed to fetch hosts" 
          },
          { status: res.status }
        );
      }
    }

    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch (error: any) {
    console.error("HOSTS GET ERROR:", error);

    // Detect backend connection refused and return a helpful message
    const backendUrl = BACKEND_URL || "<unset>";
    const cause = error?.cause;
    if (cause && cause.code === "ECONNREFUSED") {
      console.error("Backend unreachable at:", backendUrl, "(ECONNREFUSED)");
      return NextResponse.json(
        { 
          success: false,
          message: `Backend unreachable at ${backendUrl}` 
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        message: "Internal Server Error" 
      },
      { status: 500 }
    );
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
        { 
          success: false,
          message: "Action and ID required" 
        },
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
        { 
          success: false,
          message: "Invalid action" 
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // ✅ Get cookies and specifically extract accessToken
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");

    if (!accessToken) {
      console.error("❌ No accessToken cookie found");
      return NextResponse.json(
        { 
          success: false,
          message: "Unauthorized: Please log in again" 
        },
        { status: 401 }
      );
    }

    const res = await fetch(endpoint, {
      method: action === "approve" ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken.value}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error(`❌ Backend error (${res.status}):`, text.substring(0, 200));

      if (res.status === 401) {
        return NextResponse.json(
          { 
            success: false,
            message: "Unauthorized: Your session may have expired. Please log in again." 
          },
          { status: 401 }
        );
      }

      if (text.startsWith("<")) {
        console.error("Backend returned HTML:", text);
        return NextResponse.json(
          { 
            success: false,
            message: "Unauthorized or invalid backend route" 
          },
          { status: res.status }
        );
      }

      try {
        const errorData = JSON.parse(text);
        return NextResponse.json(
          { 
            success: false,
            message: errorData.message || "Failed to process request" 
          },
          { status: res.status }
        );
      } catch {
        return NextResponse.json(
          { 
            success: false,
            message: "Failed to process request" 
          },
          { status: res.status }
        );
      }
    }

    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch (error) {
    console.error("HOSTS POST ERROR:", error);
    return NextResponse.json(
      { 
        success: false,
        message: "Internal Server Error" 
      },
      { status: 500 }
    );
  }
}