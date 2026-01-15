import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://api.unrealvibe.com/api";
// const API_URL = "http://localhost:8000/api";

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join("/");
  const url = `${API_URL}/${pathString}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  let body: any = undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      body = await request.arrayBuffer();
    } catch (e) {
      // Body might be empty or already consumed
    }
  }

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      // @ts-ignore
      duplex: "half",
      cache: "no-store",
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Cache-Control", "no-store, max-age=0");

    // Production cookie handling
    const setCookieHeader = response.headers.getSetCookie();

    if (setCookieHeader && setCookieHeader.length > 0) {
      responseHeaders.delete("set-cookie");
      setCookieHeader.forEach((cookie) => {
        const isLocalhost =
          request.nextUrl.hostname === "localhost" ||
          request.nextUrl.hostname === "127.0.0.1";

        let sanitizedCookie = cookie
          .replace(/; Path=[^;]+/i, "; Path=/")
          .replace(/; SameSite=[^;]+/i, "; SameSite=None");

        if (isLocalhost) {
          // On localhost, we MUST NOT set a domain like .unrealvibe.com
          sanitizedCookie = sanitizedCookie.replace(/; Domain=[^;]+/i, "");
        } else {
          sanitizedCookie = sanitizedCookie.replace(
            /; Domain=[^;]+/i,
            "; Domain=.unrealvibe.com"
          );
        }

        if (!sanitizedCookie.includes("Secure")) {
          sanitizedCookie += "; Secure";
        }

        responseHeaders.append("set-cookie", sanitizedCookie);
      });
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
