import { useState } from "react";

export function useOtpAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async (phone: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth?action=request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) throw new Error();
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

      const res = await fetch("/api/auth?action=verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        // 🔥 REQUIRED
        credentials: "include",

        body: JSON.stringify({ phone, otp }),
      });

      if (!res.ok) throw new Error();
      return true;
    } catch {
      setError("Invalid OTP");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { sendOtp, confirmOtp, loading, error };
}
