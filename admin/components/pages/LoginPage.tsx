"use client";

import { useState } from "react";
import { Phone, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOtpAuth } from "@/hooks/useOtpAuth";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const { sendOtp, confirmOtp, loading, error } = useOtpAuth();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.length < 10) return;

    const success = await sendOtp(phone);
    if (success) {
      setStep("otp");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length < 4) return;

    const success = await confirmOtp(phone, otp);
    if (success) {
      // Use a hard redirect with window.location to ensure:
      // 1. Cookie is sent with the request (browser handles httpOnly cookies automatically)
      // 2. Full page reload ensures SSR auth check runs with the new cookie
      // 3. No race conditions with client-side routing
      // The cookie is set by the Next.js API route, so it's already available
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Event Host</h1>
          <p className="text-sm text-muted-foreground">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          {step === "phone" ? (
            /* ---------------- PHONE STEP ---------------- */
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <h2 className="text-lg font-medium">Sign In</h2>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-background text-sm"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            /* ---------------- OTP STEP ---------------- */
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <h2 className="text-lg font-medium">Verify OTP</h2>

              <p className="text-sm text-muted-foreground">
                Sent to +91 {phone}
              </p>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-background text-sm"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtp("");
                  setStep("phone");
                }}
                className="text-sm text-muted-foreground"
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
