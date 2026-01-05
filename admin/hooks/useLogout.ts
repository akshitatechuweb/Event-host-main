"use client";

import { useState } from "react";

const isProd = process.env.NODE_ENV === "production";

const getLogoutUrl = () => {
  if (isProd) {
    return `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/auth/logout`;
  }
  return "/api/admin/auth/logout";
};

export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    try {
      setLoading(true);
      await fetch(getLogoutUrl(), {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/login";
    }
  };

  return { logout, loading };
}
