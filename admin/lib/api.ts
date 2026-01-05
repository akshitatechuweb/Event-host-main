/**
 * GLOBAL API FETCHER
 * Uses SAME-ORIGIN /api/* only.
 * NEVER depends on env variables.
 * NEVER throws for dashboards.
 */

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const res = await fetch(endpoint, {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => null);

    // 🔑 Auth handling (only redirect if explicitly unauthorized)
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/admin/login";
      }
      throw new Error("Unauthorized");
    }

    // 🔑 For non-critical APIs, return data even if partial
    if (!res.ok) {
      return data as T;
    }

    return data as T;
  } catch (err) {
    // 🔒 NEVER crash UI because of fetch
    console.error("apiFetch error:", err);
    return {} as T;
  }
}
