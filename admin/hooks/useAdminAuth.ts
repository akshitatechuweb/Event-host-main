"use client";

import { useState } from "react";

export function useAdminAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.replace("/admin/dashboard");
        return { success: true };
      }

      throw new Error(data.message || "Invalid credentials");
    } catch (err: any) {
      setError(err.message);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
