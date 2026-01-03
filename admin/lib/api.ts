/**
 * Get authentication token from localStorage or cookies
 * Returns null if no token is found
 */
async function getAuthToken(): Promise<string | null> {
  // First, try to get from localStorage (if available)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      return token;
    }

    // If not in localStorage, try to get from cookies via API
    try {
      const res = await fetch("/api/auth/token", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          // Optionally store in localStorage for future use
          localStorage.setItem("accessToken", data.token);
          return data.token;
        }
      }
    } catch (error) {
      console.error("Failed to get token from API:", error);
    }
  }

  return null;
}

/**
 * Redirect to login page if not authenticated
 */
function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * Enhanced API fetch function with Bearer token authentication
 * 
 * @param endpoint - API endpoint (can be Next.js API route or backend URL)
 * @param options - Fetch options
 * @returns Promise with response data
 * @throws Error if request fails or user is unauthorized
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  // Get authentication token
  const token = await getAuthToken();

  // If no token, redirect to login or throw error
  if (!token) {
    const error = new Error("No token");
    console.error("Authentication error:", error);
    redirectToLogin();
    throw error;
  }

  // Determine if endpoint is a Next.js API route or backend URL
  const isNextApiRoute = endpoint.startsWith("/api/");
  const baseUrl = isNextApiRoute
    ? "" // Next.js API routes are relative
    : process.env.NEXT_PUBLIC_API_URL || "";

  const url = `${baseUrl}${endpoint}`;

  // Prepare headers with Bearer token
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include", // Still include cookies for Next.js API routes
      headers,
    });

    // Handle non-JSON responses
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Server returned non-JSON response: ${text}`);
    }

    const data = await res.json();

    // Handle unauthorized (401) - redirect to login
    if (res.status === 401) {
      console.error("Unauthorized access - redirecting to login");
      // Clear localStorage token if exists
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      redirectToLogin();
      throw new Error(data.message || "Unauthorized");
    }

    // Handle other errors
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    // Re-throw if it's already an Error
    if (error instanceof Error) {
      throw error;
    }
    // Otherwise, wrap in Error
    throw new Error(error instanceof Error ? error.message : "Request failed");
  }
}
