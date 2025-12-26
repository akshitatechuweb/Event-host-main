import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

/* ============================
   GET → FETCH HOST REQUESTS
============================ */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const id = searchParams.get("id");

  const cookieStore = cookies();

  if (!action) {
    return NextResponse.json(
      { message: "Action is required" },
      { status: 400 }
    );
  }

  let endpoint = "";

  // 🔹 All host requests
  if (action === "list") {
    endpoint = `${BACKEND_URL}/admin/hosts`;
  }

  // 🔹 Only pending requests
  else if (action === "pending") {
    endpoint = `${BACKEND_URL}/admin/hosts/pending`;
  }

  // 🔹 Single request
  else if (action === "single") {
    if (!id) {
      return NextResponse.json(
        { message: "Request ID is required" },
        { status: 400 }
      );
    }
    endpoint = `${BACKEND_URL}/admin/hosts/${id}`;
  }

  else {
    return NextResponse.json(
      { message: "Invalid action" },
      { status: 400 }
    );
  }

  const res = await fetch(endpoint, {
    headers: {
      Cookie: cookieStore.toString(),
    },
    credentials: "include",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

/* ============================
   POST → APPROVE / REJECT
============================ */
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const id = searchParams.get("id");

  const cookieStore = cookies();
  const body = await req.json().catch(() => ({}));

  if (!action || !id) {
    return NextResponse.json(
      { message: "Action and Request ID are required" },
      { status: 400 }
    );
  }

  let endpoint = "";

  // ✅ Approve host request
  if (action === "approve") {
    endpoint = `${BACKEND_URL}/admin/hosts/${id}/approve`;
  }

  // ❌ Reject host request
  else if (action === "reject") {
    endpoint = `${BACKEND_URL}/admin/hosts/${id}/reject`;
  }

  else {
    return NextResponse.json(
      { message: "Invalid action" },
      { status: 400 }
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
