import { NextRequest } from "next/server";
import "server-only";

// This file is safe to use in Server Components / API Routes
// It directly talks to the external backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.unrealvibe.com";

/**
 * Server-side helper to fetch from backend.
 * Uses hardcoded API URL but forwards cookies from the incoming request.
 */
export async function adminBackendFetch(
  path: string,
  req: NextRequest,
  init: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}/api/admin${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init.headers || {});
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

/**
 * Generic backend fetch (no /api/admin prefix)
 */
export async function backendFetch(
  path: string,
  req: NextRequest,
  init: RequestInit = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init.headers || {});
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