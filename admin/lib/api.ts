/**
 * Redirect to login page if not authenticated
 */
function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * API fetch function that uses direct backend URLs with httpOnly cookie authentication
 * 
 * @param endpoint - Backend API endpoint (relative path, e.g., "/api/user" or "/api/events")
 * @param options - Fetch options
 * @returns Promise with response data
 * @throws Error if request fails or user is unauthorized
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  // Ensure endpoint starts with / for proper URL construction
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;

  // Prepare headers (no Bearer token - backend uses httpOnly cookies)
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include", // Critical: sends httpOnly cookies
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
