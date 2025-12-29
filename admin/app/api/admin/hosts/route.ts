import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET() {
  try {
    // Proxy to backend admin hosts endpoint (approved hosts)
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join("; ");

    const res = await fetch(`${BACKEND_URL}/api/admin/hosts`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    const text = await res.text();

    if (text.startsWith("<")) {
      console.error("Backend returned HTML:", text);
      return NextResponse.json({ message: "Unauthorized" }, { status: res.status });
    }

    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch (error: any) {
    console.error("ADMIN HOSTS GET ERROR:", error);

    const cause = error?.cause;
    if (cause && cause.code === "ECONNREFUSED") {
      console.error("Backend unreachable at:", BACKEND_URL, "(ECONNREFUSED)");
      return NextResponse.json({ message: `Backend unreachable at ${BACKEND_URL}` }, { status: 502 });
    }

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
