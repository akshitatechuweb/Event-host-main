import { NextRequest, NextResponse } from "next/server";

// 🌍 CONFIGURATION
const PROD_API = "https://api.unrealvibe.com/api";
const LOCAL_API_V4 = "http://127.0.0.1:8000/api";
const LOCAL_API_V6 = "http://localhost:8000/api";

export async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  
  // ✂️ STRIP 'admin' prefix for the "Clean" attempt
  const hasAdmin = path[0] === "admin";
  const segments = hasAdmin ? path.slice(1) : path;
  
  const cleanPath = segments.join("/");
  const adminPath = "admin/" + cleanPath;

  // 🗺️ SPECIAL MAPPINGS
  let method = request.method;
  
  // 🌐 RESOLVE TARGETS (Multi-Layer Strategy)
  const isLocalEnv = request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1";
  
  const bases = isLocalEnv ? [LOCAL_API_V4, LOCAL_API_V6, PROD_API] : [PROD_API];
  
  // We try Clean first, then Admin as fallback if 404
  const paths = [cleanPath, adminPath];

  let lastError = null;
  let response: Response | null = null;
  let bodyBlob: any = undefined;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");

  try {
    if (!["GET", "HEAD"].includes(method)) {
      bodyBlob = await request.blob();
    }
  } catch {
    bodyBlob = undefined;
  }

  // 🔄 TRY ALL BASES
  for (const base of bases) {
    // 🔄 TRY BOTH PATH STYLES (Clean vs Admin)
    for (const targetPath of paths) {
      // Logic: If it's the admin creator/update, handle special mapping
      let finalPath = targetPath;
      if (cleanPath === "events" && method === "POST") finalPath = targetPath.replace("events", "create-event");
      else if (segments[0] === "events" && segments.length === 2 && method === "PUT") finalPath = targetPath.replace(`events/${segments[1]}`, `event/update-event/${segments[1]}`);

      const url = `${base}/${finalPath}${request.nextUrl.search}`;
      console.log(`[PROXY] Trying: ${method} ${url}`);

      try {
        response = await fetch(url, {
          method,
          headers,
          body: bodyBlob,
          // @ts-ignore
          duplex: "half", 
          credentials: "include",
          cache: "no-store",
        });

        // 🎯 Success Criteria: We accept anything except 404 for the first path
        // If it's a 404, we continue to try the next path style
        if (response.status !== 404) {
          console.log(`[PROXY] Success: ${response.status} from ${url}`);
          return processResponse(response, request);
        }
        
        console.warn(`[PROXY] 404 from ${url}, trying fallback...`);
      } catch (error: any) {
        console.error(`[PROXY] Error connecting to ${base}: ${error.message}`);
        lastError = error;
      }
    }
  }

  // ❌ TOTAL FAILURE
  return NextResponse.json({ 
    success: false, 
    error: "No backend target responded correctly", 
    details: lastError?.message,
    tried: bases.flatMap(b => paths.map(p => `${b}/${p}`))
  }, { status: 502 });
}

// 📥 HELPER: Process and Clean Headers/Cookies
async function processResponse(response: Response, request: NextRequest) {
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("Cache-Control", "no-store, max-age=0");
  
  const setCookieHeader = response.headers.getSetCookie();
  if (setCookieHeader && setCookieHeader.length > 0) {
      responseHeaders.delete("set-cookie");
      setCookieHeader.forEach(cookie => {
          let sanitizedCookie = cookie
              .replace(/; Domain=[^;]+/i, "")
              .replace(/; Path=[^;]+/i, "") + "; Path=/";
          if (!request.nextUrl.protocol.startsWith('https')) sanitizedCookie = sanitizedCookie.replace(/; Secure/i, "");
          sanitizedCookie = sanitizedCookie.replace(/; SameSite=[^;]+/i, "") + "; SameSite=Lax";
          responseHeaders.append("set-cookie", sanitizedCookie);
      });
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy; export const POST = proxy; export const PUT = proxy;
export const PATCH = proxy; export const DELETE = proxy; export const HEAD = proxy;
