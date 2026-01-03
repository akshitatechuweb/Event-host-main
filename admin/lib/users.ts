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

/**
 * Fetch regular users (non-host users)
 * Uses Bearer token authentication via apiFetch
 */
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

  try {
    // Call Next.js API route which handles Bearer token authentication
    const data = await apiFetch(`/api/users?${queryParams.toString()}`);
    
    // Ensure response has expected structure
    if (!data || !data.success) {
      throw new Error(data?.message || "Failed to fetch users");
    }

    return {
      success: data.success,
      users: data.users || [],
      total: data.total || 0,
      page: data.page || page,
      totalPages: data.totalPages || 1,
      limit: data.limit || limit,
    };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
}

/**
 * Deactivate a user
 * Uses Bearer token authentication via apiFetch
 */
export async function deactivateUser(userId: string): Promise<void> {
  try {
    await apiFetch(`/api/users/deactivate/${userId}`, {
      method: "PUT",
    });
  } catch (error) {
    console.error("Failed to deactivate user:", error);
    throw error;
  }
}