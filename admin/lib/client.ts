
import { toast } from "sonner";

/**
 * Helper to make API requests from the client side.
 * ALWAYS uses relative paths to ensure requests go through the Next.js proxy.
 */
export async function clientFetch(path: string, init?: RequestInit) {
  // Ensure path starts with /api
  const normalizedPath = path.startsWith("/api") ? path : `/api${path.startsWith("/") ? "" : "/"}${path}`;
  
  try {
    const res = await fetch(normalizedPath, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (res.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
         window.location.replace("/admin/login");
      }
      // Prevent callers from attempting to parse an unauthorized response body.
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      // Try to extract JSON error message when possible, otherwise use status text.
      const errData = await res.json().catch(() => null);
      const errMessage = errData?.message || res.statusText || `Request failed with status ${res.status}`;
      throw new Error(errMessage);
    }

    return res;
  } catch (error) {
    console.error("Client fetch error:", error);
    toast.error("Network error. Please check your connection.");
    throw error;
  }
}
