export interface User {
  _id: string;
  name?: string;
  email?: string;
  phone: string;
  city?: string;
  isActive: boolean;
}

interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface FetchUsersResponse {
  users: User[];
  page: number;
  totalPages: number;
  total: number;
}

/**
 * ✅ SAME-ORIGIN USERS FETCH
 * ❌ NO env usage
 * ❌ NO backend URLs
 */
export async function fetchRegularUsers({
  page = 1,
  limit = 20,
  search,
}: FetchUsersParams): Promise<FetchUsersResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("role", "user");

  if (search) {
    params.set("search", search);
  }

  const res = await fetch(`/api/users?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch users");
  }

  return data;
}

/**
 * Optional: deactivate user
 */
export async function deactivateUser(userId: string): Promise<void> {
  const res = await fetch(`/api/user/${userId}/deactivate`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Failed to deactivate user");
  }
}
