"use client";

import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getLogoutUrl() {
  // ✅ Always prefer explicit backend URL
  if (API_BASE_URL) {
    return `${API_BASE_URL}/api/admin/auth/logout`;
  }

  // Fallback (local dev / proxy)
  return "/api/admin/auth/logout";
}

export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    try {
      setLoading(true);

      await fetch(getLogoutUrl(), {
        method: "POST",
        credentials: "include", // 🔑 send httpOnly cookie
      });
    } catch (err) {
      // Logout must be best-effort
      console.error("Logout failed:", err);
    } finally {
      // ✅ Always hard redirect to clear client state
      window.location.href = "/login";
    }
  };

  return {
    logout,
    loading,
  };
}
