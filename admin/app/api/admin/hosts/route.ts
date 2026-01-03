import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}` : null;

export async function GET() {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { message: "NEXT_PUBLIC_API_BASE_URL is not defined" },
        { status: 500 }
      );
    }

    // Proxy to backend admin hosts endpoint (approved hosts)
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(`${BACKEND_URL}/api/admin/hosts`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    const text = await res.text();

    // Backend returned HTML (likely auth redirect or error page)
    if (text.startsWith("<")) {
      console.error("Backend returned HTML:", text);
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: res.status }
      );
    }

    const parsed: unknown = JSON.parse(text);
    return NextResponse.json(parsed, { status: res.status });
  } catch (error: unknown) {
    console.error("ADMIN HOSTS GET ERROR:", error);

    const cause = (error as { cause?: { code?: string } }).cause;
    if (cause?.code === "ECONNREFUSED") {
      console.error(
        "Backend unreachable at:",
        BACKEND_URL,
        "(ECONNREFUSED)"
      );
      return NextResponse.json(
        { message: `Backend unreachable at ${BACKEND_URL}` },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
