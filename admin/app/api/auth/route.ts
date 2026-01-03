// app/api/auth/action/route.ts
import { NextResponse } from "next/server";

// BACKEND_URL should point to the actual backend server (e.g., https://api.unrealvibe.com)
// This is used by Next.js API routes to call the backend
// Priority: BACKEND_URL env var > derive from NEXT_PUBLIC_API_BASE_URL
function getBackendUrl(): string | null {
  // First, try explicit BACKEND_URL env var
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  
  // If NEXT_PUBLIC_API_BASE_URL is set and looks like a backend URL (contains /api or api.), use it
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL;
    // If it's clearly a backend URL (has api. subdomain or ends with /api), use it
    if (url.includes('api.') || url.endsWith('/api')) {
      return url;
    }
    // Otherwise, derive backend URL from frontend URL
    // e.g., https://unrealvibe.com -> https://api.unrealvibe.com
    try {
      const frontendUrl = new URL(url);
      if (frontendUrl.hostname.startsWith('www.')) {
        frontendUrl.hostname = frontendUrl.hostname.replace('www.', 'api.');
      } else if (!frontendUrl.hostname.startsWith('api.')) {
        frontendUrl.hostname = `api.${frontendUrl.hostname}`;
      }
      return frontendUrl.toString().replace(/\/$/, ''); // Remove trailing slash
    } catch {
      // If URL parsing fails, return as-is
      return url;
    }
  }
  
  return null;
}

const BACKEND_URL = getBackendUrl();

/**
 * Parse Set-Cookie header to extract cookie value
 * Handles various formats: "accessToken=value; Path=/; HttpOnly" or "accessToken=value"
 */
function parseCookieValue(setCookieHeader: string): string | null {
  // Format: "accessToken=value; Path=/; HttpOnly; Secure; SameSite=None"
  // Or: "accessToken=value; Domain=.example.com; Path=/; HttpOnly; Secure; SameSite=None"
  const match = setCookieHeader.match(/^accessToken=([^;]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

export async function POST(req: Request) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { message: "NEXT_PUBLIC_API_BASE_URL is not defined" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    if (!action) {
      return NextResponse.json(
        { message: "Action required" },
        { status: 400 }
      );
    }

    let backendRes: Response;

    try {
      if (action === "request-otp") {
        backendRes = await fetch(`${BACKEND_URL}/api/auth/request-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else if (action === "verify-otp") {
        backendRes = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
      }
    } catch (fetchError: unknown) {
      console.error("Backend fetch error:", fetchError);
      
      const cause = (fetchError as { cause?: { code?: string } }).cause;
      if (cause?.code === "ECONNREFUSED") {
        return NextResponse.json(
          { 
            success: false,
            message: `Backend unreachable at ${BACKEND_URL}. Please check if the backend server is running.` 
          },
          { status: 502 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false,
          message: "Failed to connect to backend server" 
        },
        { status: 502 }
      );
    }

    // Get response as text first to handle non-JSON responses
    const responseText = await backendRes.text();
    
    // Check if backend returned HTML (error page)
    if (responseText.startsWith("<")) {
      console.error("Backend returned HTML instead of JSON:", responseText.substring(0, 200));
      return NextResponse.json(
        { 
          success: false,
          message: "Backend returned an error page. Please check backend server logs." 
        },
        { status: backendRes.status || 500 }
      );
    }

    // Try to parse as JSON
    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse backend response as JSON:", responseText.substring(0, 200));
      return NextResponse.json(
        { 
          success: false,
          message: "Backend returned invalid JSON response" 
        },
        { status: backendRes.status || 500 }
      );
    }

    // Create response with correct status
    const response = NextResponse.json(data, { status: backendRes.status });

    // For verify-otp, we need to set the cookie on the Next.js domain
    // Extract token from backend's Set-Cookie and set it with correct attributes
    if (action === "verify-otp" && backendRes.status === 200 && data.success) {
      let tokenValue: string | null = null;
      
      // Method 1: Try to extract from Set-Cookie header (preferred)
      // Use getAll('set-cookie') for compatibility with fetch API
      const setCookieHeader = backendRes.headers.get("set-cookie");
      if (setCookieHeader) {
        // Set-Cookie can be a single string or comma-separated for multiple cookies
        const cookies = setCookieHeader.split(/,(?=\w+\=)/); // Split on comma followed by cookie name
        for (const cookie of cookies) {
          const parsed = parseCookieValue(cookie.trim());
          if (parsed) {
            tokenValue = parsed;
            break;
          }
        }
      }
      
      // Method 2: Fallback - try getSetCookie() if available (Node.js 18+)
      if (!tokenValue && typeof backendRes.headers.getSetCookie === "function") {
        const setCookieHeaders = backendRes.headers.getSetCookie();
        for (const setCookieHeader of setCookieHeaders) {
          const parsed = parseCookieValue(setCookieHeader);
          if (parsed) {
            tokenValue = parsed;
            break;
          }
        }
      }
      
      // Method 3: Fallback - extract from response body if backend returns token
      // This is a safety net in case Set-Cookie parsing fails
      if (!tokenValue && data.token) {
        tokenValue = data.token;
        console.warn("⚠️  Using token from response body (Set-Cookie extraction failed)");
      }
      
      // If we still don't have a token, this is a critical error
      if (!tokenValue) {
        console.error("❌ CRITICAL: No accessToken found in Set-Cookie headers or response body");
        console.error("Set-Cookie header:", backendRes.headers.get("set-cookie"));
        console.error("Response data:", data);
        // Still return success to user, but log the error for debugging
      } else {
        // Set cookie on Next.js domain with production-safe attributes
        const isProd = process.env.NODE_ENV === "production";
        
        // Cookie options for Next.js domain
        // Note: We do NOT set domain here - let it default to the current domain
        // This ensures the cookie is scoped to the Next.js frontend domain
        const cookieOptions: {
          httpOnly: boolean;
          secure: boolean;
          sameSite: "none" | "lax" | "strict";
          path: string;
          maxAge: number;
        } = {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        };
        
        // Only set domain if explicitly configured (for shared domain scenarios)
        // Otherwise, let it default to the current domain
        if (isProd && process.env.COOKIE_DOMAIN) {
          // If COOKIE_DOMAIN is set, use it (e.g., ".unrealvibe.com" for shared cookies)
          // But typically, we want cookies scoped to each domain separately
          // So we'll only use this if really needed
          // cookieOptions.domain = process.env.COOKIE_DOMAIN;
        }
        
        response.cookies.set("accessToken", tokenValue, cookieOptions);
        
        console.log("✅ Cookie set on Next.js domain successfully", {
          httpOnly: cookieOptions.httpOnly,
          secure: cookieOptions.secure,
          sameSite: cookieOptions.sameSite,
          path: cookieOptions.path,
        });
      }
    }

    return response;
  } catch (error: unknown) {
    console.error("AUTH OTP API ERROR:", error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid response from server" 
        },
        { status: 500 }
      );
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage 
      },
      { status: 500 }
    );
  }
}