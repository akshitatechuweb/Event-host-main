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

      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }

      // Fetch token after login (for localStorage fallback)
      try {
        const tokenRes = await fetch("/api/auth/token", {
          method: "GET",
          credentials: "include",
        });

        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          if (tokenData.token) {
            localStorage.setItem("accessToken", tokenData.token);
          }
        }
      } catch (tokenError) {
        console.warn("Could not store token in localStorage:", tokenError);
      }

      return {
        success: true,
        role: data.role,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}

