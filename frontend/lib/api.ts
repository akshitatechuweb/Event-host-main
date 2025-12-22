export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }
  )

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || "Request failed")
  }

  return data
}
