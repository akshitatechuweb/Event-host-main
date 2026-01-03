 
import { useState } from "react";
 
export function useOtpAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const sendOtp = async (phone: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use Next.js proxy route to handle cookie domain transfer
      // The proxy extracts cookie from backend and sets it on frontend domain
      const res = await fetch(`/api/auth?action=request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });

      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (phone: string, otp: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use Next.js proxy route to handle cookie domain transfer
      // The proxy extracts cookie from backend response and sets it on frontend domain
      // This is necessary because backend sets cookie on api.unrealvibe.com
      // but frontend needs it on the frontend domain
      const res = await fetch(`/api/auth?action=verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp }),
      });

      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      // Cookie is now set on frontend domain by the proxy route
      // The cookie will be sent with subsequent requests via credentials: "include"
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };
 
  return { sendOtp, confirmOtp, loading, error };
}