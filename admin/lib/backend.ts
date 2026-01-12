import { NextRequest } from "next/server";
import "server-only";

// This file is safe to use in Server Components / API Routes
// It directly talks to the external backend

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://api.unrealvibe.com").replace(/\/+$/, "");
// export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");


/**
 * Robust proxy fetch for API routes.
 * Forwards all headers and handles streaming bodies.
 */
export async function proxyFetch(
  url: string,
  req: NextRequest,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers();
  
  // Forward all headers except restricted ones
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (k !== "host" && k !== "connection" && k !== "content-length") {
      headers.set(key, value);
    }
  });

  // Explicitly ensure cookie is forwarded if not already in headers
  const cookie = req.headers.get("cookie");
  if (cookie && !headers.has("cookie")) {
    headers.set("cookie", cookie);
  }

  // Non-GET/HEAD requests need a body (if present)
  const hasBody = !["GET", "HEAD"].includes(init.method || req.method);

  return fetch(url, {
    ...init,
    headers,
    body: hasBody ? req.body : undefined,
    // @ts-ignore
    duplex: "half", 
    credentials: "include",
    cache: "no-store",
  });
}

/**
 * Server-side helper to fetch from backend.
 * Uses hardcoded API URL but forwards cookies from the incoming request.
 */
export async function adminBackendFetch(
  path: string,
  req: NextRequest,
  init: RequestInit = {}
): Promise<Response> {
  // Fix: prevent double /admin prefix using regex
  const cleanPath = path.replace(/^\/admin/, "");
  const url = `${API_BASE_URL}/api/admin${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;

  const headers = new Headers(init.headers || {});
  const cookie = req.headers.get("cookie");

  if (cookie && !headers.has("cookie")) {
    headers.set("cookie", cookie);
  }

  // Also forward other common headers if they exist
  const contentType = req.headers.get("content-type");
  if (contentType && !headers.has("content-type")) {
    headers.set("content-type", contentType);
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
    // @ts-ignore
    duplex: init.body ? "half" : undefined,
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

  const contentType = req.headers.get("content-type");
  if (contentType && !headers.has("content-type")) {
    headers.set("content-type", contentType);
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
    // @ts-ignore
    duplex: init.body ? "half" : undefined,
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