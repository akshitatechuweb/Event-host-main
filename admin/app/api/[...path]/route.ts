
import { NextRequest, NextResponse } from "next/server";

const API_URL = "https://api.unrealvibe.com/api";

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathString = path.join("/");
  const url = `${API_URL}/${pathString}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body: request.body,
      // @ts-ignore
      duplex: "half", 
      cache: "no-store",
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Cache-Control", "no-store, max-age=0");
    
    // Aggressive Cookie Fixing
    const setCookieHeader = response.headers.getSetCookie();
    
    if (setCookieHeader && setCookieHeader.length > 0) {
        responseHeaders.delete("set-cookie");
        setCookieHeader.forEach(cookie => {
            let sanitizedCookie = cookie
                // Remove Domain completely so it defaults to current origin (localhost)
                .replace(/; Domain=[^;]+/i, "")
                // Force Path=/ to ensure it works everywhere
                .replace(/; Path=[^;]+/i, "") + "; Path=/";

            // ⚠️ CRITICAL: Strip 'Secure' on localhost/http to prevent browser from dropping it
            sanitizedCookie = sanitizedCookie.replace(/; Secure/i, "");

            // Enforce SameSite=Lax for compatibility
            sanitizedCookie = sanitizedCookie.replace(/; SameSite=[^;]+/i, "") + "; SameSite=Lax";

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
