import { NextRequest } from "next/server";

/**
 * Resolve the base URL for the Express backend.
 * In production set NEXT_PUBLIC_API_URL, e.g. https://api.unrealvibe.com
 */
export function getBackendBaseUrl(req?: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_ORIGIN;

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  if (req) {
    return req.nextUrl.origin.replace(/\/+$/, "");
  }

  const fallback = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

  return fallback.replace(/\/+$/, "");
}

function buildAdminUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  // Always mount under /api/admin on the backend
  return `${normalizedBase}/api/admin${normalizedPath}`;
}

export async function adminBackendFetch(
  path: string,
  req: NextRequest,
  init: RequestInit = {}
): Promise<Response> {
  const baseUrl = getBackendBaseUrl(req);
  const url = buildAdminUrl(baseUrl, path);

  const headers = new Headers(init.headers || undefined);
  const cookie = req.headers.get("cookie");

  if (cookie && !headers.has("cookie")) {
    headers.set("cookie", cookie);
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

export async function safeJson<T = unknown>(
  res: Response
): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
  text?: string;
}> {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = (await res.json()) as T;
    return { ok: res.ok, status: res.status, data };
  }

  const text = await res.text();
  return { ok: res.ok, status: res.status, data: null, text };
}