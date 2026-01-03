import { NextResponse } from "next/server";

// BACKEND_URL should point to the actual backend server (e.g., https://api.unrealvibe.com)
// This is used by Next.js API routes to call the backend
// Priority: BACKEND_URL env var > derive from NEXT_PUBLIC_API_BASE_URL
function getBackendUrl(): string | null {
  // First, try explicit BACKEND_URL env var
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  
  // If NEXT_PUBLIC_API_BASE_URL is set
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    // If it's localhost or 127.0.0.1, use it as-is (it's already the backend)
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return url.replace(/\/+$/, ''); // Remove trailing slashes
    }
    
    // If it's clearly a backend URL (has api. subdomain or ends with /api), use it
    if (url.includes('api.') || url.endsWith('/api')) {
      return url.replace(/\/+$/, ''); // Remove trailing slashes
    }
    
    // Otherwise, derive backend URL from frontend URL
    // e.g., https://unrealvibe.com -> https://api.unrealvibe.com
    try {
      const frontendUrl = new URL(url);
      // Don't transform localhost
      if (frontendUrl.hostname === 'localhost' || frontendUrl.hostname === '127.0.0.1') {
        return url.replace(/\/+$/, '');
      }
      
      if (frontendUrl.hostname.startsWith('www.')) {
        frontendUrl.hostname = frontendUrl.hostname.replace('www.', 'api.');
      } else if (!frontendUrl.hostname.startsWith('api.')) {
        frontendUrl.hostname = `api.${frontendUrl.hostname}`;
      }
      return frontendUrl.toString().replace(/\/+$/, ''); // Remove trailing slash
    } catch {
      // If URL parsing fails, return as-is
      return url.replace(/\/+$/, '');
    }
  }
  
  return null;
}

const BACKEND_URL = getBackendUrl();

/**
 * Parse Set-Cookie header to extract cookie value
 */
function parseCookieValue(setCookieHeader: string): string | null {
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
        { success: false, message: "NEXT_PUBLIC_API_BASE_URL is not defined" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    let backendRes: Response;

    try {
      // Call backend admin login endpoint
      // Normalize BACKEND_URL - remove trailing /api and trailing slashes
      let normalizedBackendUrl = BACKEND_URL.trim();
      if (normalizedBackendUrl.endsWith('/api')) {
        normalizedBackendUrl = normalizedBackendUrl.slice(0, -4);
      }
      // Remove any trailing slashes
      normalizedBackendUrl = normalizedBackendUrl.replace(/\/+$/, '');
      
      // Construct the full endpoint path
      const backendEndpoint = `${normalizedBackendUrl}/api/admin/auth/login`;
      
      console.log("Calling backend admin login:", backendEndpoint);
      console.log("BACKEND_URL:", BACKEND_URL);
      console.log("Normalized URL:", normalizedBackendUrl);
      
      backendRes = await fetch(backendEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch (fetchError: unknown) {
      console.error("Backend fetch error:", fetchError);
      console.error("BACKEND_URL:", BACKEND_URL);
      
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
          message: `Failed to connect to backend server at ${BACKEND_URL}. Error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` 
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

    // Extract token from backend's Set-Cookie and set it on Next.js domain
    if (backendRes.status === 200 && data.success) {
      let tokenValue: string | null = null;
      
      // Method 1: Try to extract from Set-Cookie header
      const setCookieHeader = backendRes.headers.get("set-cookie");
      if (setCookieHeader) {
        const cookies = setCookieHeader.split(/,(?=\w+\=)/);
        for (const cookie of cookies) {
          const parsed = parseCookieValue(cookie.trim());
          if (parsed) {
            tokenValue = parsed;
            break;
          }
        }
      }
      
      // Method 2: Fallback - try getSetCookie() if available
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
      
      // Method 3: Fallback - extract from response body
      if (!tokenValue && data.token) {
        tokenValue = data.token;
        console.warn("⚠️  Using token from response body (Set-Cookie extraction failed)");
      }
      
      if (tokenValue) {
        // Set cookie on Next.js domain with production-safe attributes
        const isProd = process.env.NODE_ENV === "production";
        
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
        
        response.cookies.set("accessToken", tokenValue, cookieOptions);
        
        console.log("✅ Admin login cookie set on Next.js domain successfully", {
          httpOnly: cookieOptions.httpOnly,
          secure: cookieOptions.secure,
          sameSite: cookieOptions.sameSite,
          path: cookieOptions.path,
        });
      } else {
        console.error("❌ CRITICAL: No accessToken found in Set-Cookie headers or response body");
        console.error("Set-Cookie header:", backendRes.headers.get("set-cookie"));
        console.error("Response data:", data);
      }
    }

    return response;
  } catch (error: unknown) {
    console.error("ADMIN LOGIN API ERROR:", error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false,
          message: "Invalid response from server" 
        },
        { status: 500 }
      );
    }
    
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

