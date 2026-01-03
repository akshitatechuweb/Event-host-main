// Shared auth utility for SSR and API routes
import { cookies } from "next/headers";

export type AuthUser = {
  id: string;
  role?: string;
};

export type AuthCheckResult = {
  success: boolean;
  user?: AuthUser;
  message?: string;
};

/**
 * Check authentication status in SSR/API routes
 * Returns the user if authenticated, null otherwise
 */
export async function checkAuth(): Promise<AuthCheckResult> {
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}` : null;
    
    if (!BACKEND_URL) {
      return {
        success: false,
        message: "NEXT_PUBLIC_API_BASE_URL is not defined",
      };
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    // Forward the JWT cookie to the backend
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const data = await res.json();
    
    if (!data.success || !data.user) {
      return {
        success: false,
        message: "Invalid auth response",
      };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        role: data.user.role,
      },
    };
  } catch (error) {
    console.error("Auth check failed:", error);
    return {
      success: false,
      message: "Auth check failed",
    };
  }
}

