// lib/users.ts
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

export async function fetchRegularUsers(
  params: FetchUsersParams = {}
): Promise<FetchUsersResponse> {
  const { page = 1, limit = 20, search, city } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    role: "user", // This filters only regular users (not hosts)
  });

  if (search) queryParams.append("search", search);
  if (city) queryParams.append("city", city);

  // ✅ CHANGED: /api/users → /api/user
  const data = await apiFetch(`/api/user?${queryParams.toString()}`);
  return data;
}

export async function deactivateUser(userId: string): Promise<void> {
  // ✅ CHANGED: /api/users → /api/user
  await apiFetch(`/api/user/deactivate/${userId}`, {
    method: "PUT",
  });
}