import { useState } from "react";

export function useOtpAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===========================
  // 📩 SEND OTP
  // ===========================
  const sendOtp = async (phone: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use Next.js API route proxy (relative URL - always on same domain as frontend)
      // This ensures cookies are handled correctly and set on the frontend domain
      const res = await fetch(`/api/auth?action=request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });

      // Get response as text first to handle non-JSON responses gracefully
      const responseText = await res.text();
      
      // Check if response is HTML (error page)
      if (responseText.startsWith("<")) {
        console.error("Server returned HTML instead of JSON:", responseText.substring(0, 200));
        throw new Error("Server returned an error page. Please check server configuration.");
      }

      // Try to parse as JSON
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", responseText.substring(0, 200));
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`);
      }

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

  // ===========================
  // ✅ VERIFY OTP
  // ===========================
  const confirmOtp = async (phone: string, otp: string) => {
    try {
      setLoading(true);
      setError(null);

      // Use Next.js API route proxy (relative URL - always on same domain as frontend)
      // This ensures cookies are set on the correct domain
      // This is critical for production where frontend and backend are on different domains
      const res = await fetch(`/api/auth?action=verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp }),
      });

      // Get response as text first to handle non-JSON responses gracefully
      const responseText = await res.text();
      
      // Check if response is HTML (error page)
      if (responseText.startsWith("<")) {
        console.error("Server returned HTML instead of JSON:", responseText.substring(0, 200));
        throw new Error("Server returned an error page. Please check server configuration.");
      }

      // Try to parse as JSON
      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", responseText.substring(0, 200));
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      // Cookie is now set on the Next.js domain via the API route proxy
      // No need to fetch token separately - the httpOnly cookie is already set
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
