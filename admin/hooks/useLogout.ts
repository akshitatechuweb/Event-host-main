"use client";

import { useState } from "react";

export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    try {
      setLoading(true);
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    } finally {
      window.location.href = "/admin/login";
    }
  };

  return { logout, loading };
}
