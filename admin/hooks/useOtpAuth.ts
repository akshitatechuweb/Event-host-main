// hooks/useOtpAuth.ts
import { useState } from "react";

export function useOtpAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async (phone: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/action?action=request-otp", {  // ← FIXED
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP");
        return false;
      }

      return true;
    } catch {
      setError("Failed to send OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async (phone: string, otp: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/action?action=verify-otp", {  // ← FIXED
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ← Correct: needed for cookies on verify
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid OTP");
        return false;
      }

      return true;
    } catch {
      setError("Invalid OTP or network error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { sendOtp, confirmOtp, loading, error };
}