/**
 * Centralized API helper
 * - Backend owns authentication
 * - Cookies are sent automatically
 * - No redirects, no auth logic here
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("/")
    ? `${API_BASE_URL}${endpoint}`
    : `${API_BASE_URL}/${endpoint}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include", // 🔑 send httpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  const contentType = res.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    data = await res.json();
  }

  if (!res.ok) {
    const message =
      data?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data as T;
}
