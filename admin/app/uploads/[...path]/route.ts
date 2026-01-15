import { NextRequest, NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = isProd
  ? "https://api.unrealvibe.com"
  : "http://localhost:8000";

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join("/");
  const url = `${BACKEND_URL}/uploads/${pathString}${request.nextUrl.search}`;

  console.log("Proxying upload request to:", url);

  try {
    const response = await fetch(url, {
      method: "GET", // Uploads are always GET
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch image from backend:",
        response.status,
        url
      );
      return new NextResponse("Image not found", { status: 404 });
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers.get("Content-Type") || "image/png"
    );
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Upload proxy error:", error);
    return new NextResponse("Proxy failed", { status: 500 });
  }
}

export const GET = proxy;
