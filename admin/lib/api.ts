export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");

  return data as T;
}
