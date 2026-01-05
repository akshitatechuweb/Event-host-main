import { apiFetch } from "./api";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  gender?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  profileCompletion: number;
  createdAt: string;
}

export interface FetchUsersResponse {
  success: boolean;
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
}

/**
 * Fetch regular users (non-host users)
 * Auth via httpOnly cookie
 */
export async function fetchRegularUsers(
  params: FetchUsersParams = {}
): Promise<FetchUsersResponse> {
  const { page = 1, limit = 20, search, city } = params;

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    role: "user",
  });

  if (search) queryParams.append("search", search);
  if (city) queryParams.append("city", city);

  const response: unknown = await apiFetch(
    `/api/user?${queryParams.toString()}`
  );

  let users: User[] = [];
  let total = 0;
  let totalPages = 1;
  let currentPage = page;
  let currentLimit = limit;

  // ✅ Case 1: backend returns User[]
  if (Array.isArray(response)) {
    users = response as User[];
    total = users.length;
    totalPages = Math.ceil(total / limit);
  }

  // ✅ Case 2: backend returns object
  else if (typeof response === "object" && response !== null) {
    const data = response as {
      users?: User[];
      data?: User[];
      total?: number;
      totalPages?: number;
      page?: number;
      limit?: number;
    };

    users = data.users ?? data.data ?? [];
    total = data.total ?? users.length;
    totalPages = data.totalPages ?? Math.ceil(total / limit);
    currentPage = data.page ?? page;
    currentLimit = data.limit ?? limit;
  }

  return {
    success: true,
    users,
    total,
    page: currentPage,
    totalPages,
    limit: currentLimit,
  };
}

/**
 * Deactivate a user
 * Auth via httpOnly cookie
 */
export async function deactivateUser(userId: string): Promise<void> {
  await apiFetch(`/api/user/deactivate/${userId}`, {
    method: "PUT",
  });
}
