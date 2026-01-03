 
import { useState } from "react";
 
 
const AUTH_API = "/api/auth";
 
export function useOtpAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
 
  const sendOtp = async (phone: string) => {
    try {
      setLoading(true);
      setError(null);
 
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/request-otp`, {
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
 
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-otp`, {
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
 
      // Fetch token after login
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