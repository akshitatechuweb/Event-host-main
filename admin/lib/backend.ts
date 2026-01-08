import { NextRequest } from "next/server";
import "server-only";

// This file is safe to use in Server Components / API Routes
// It directly talks to the external backend

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.unrealvibe.com").replace(/\/+$/, "");

/**
 * Robust proxy fetch for API routes.
 * Forwards all headers and handles streaming bodies.
 */
export async function proxyFetch(
  url: string,
  req: NextRequest,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(req.headers);
  
  // Clean up restricted headers
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length"); // Fetch will recalculate this

  // Non-GET/HEAD requests need a body (if present)
  const hasBody = !["GET", "HEAD"].includes(init.method || req.method);

  return fetch(url, {
    ...init,
    headers,
    body: hasBody ? req.body : undefined,
    // @ts-ignore
    duplex: "half", 
    cache: "no-store",
  });
}

/**
 * Server-side helper to fetch from backend.
 * Automatically handles path normalization to prevent double /api or /admin prefixes.
 * Detects Local vs Prod based on hostname.
 */
function getBackendUrl(path: string, request?: NextRequest): string {
  // 💡 TIP: If you want to use a local backend, change this to true
  const USE_LOCAL = false; 
  
  const isLocal = (request?.nextUrl.hostname === "localhost" || request?.nextUrl.hostname === "127.0.0.1") && USE_LOCAL;
  const base = isLocal ? "http://localhost:8000" : API_BASE_URL;
  
  // 🧹 ULTRA CLEAN: remove /api and /admin if they exist at the start
  let cleanPath = path
    .replace(/^\/?api\/?/, "")
    .replace(/^\/?admin\/?/, "")
    .replace(/^\//, "");
  
  return `${base}/api/${cleanPath}`;
}

export async function adminBackendFetch(
  path: string,
  req: NextRequest,
  init: RequestInit = {}
): Promise<Response> {
  const url = getBackendUrl(path, req);

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
 * Generic backend fetch
 */
export async function backendFetch(
  path: string,
  req: NextRequest,
  init: RequestInit = {}
): Promise<Response> {
  return adminBackendFetch(path, req, init);
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