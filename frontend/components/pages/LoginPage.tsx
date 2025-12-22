"use client"

import { useState } from "react"
import { Phone, Lock } from "lucide-react"
import { useOtpAuth } from "@/hooks/useOtpAuth"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"phone" | "otp">("phone")

  const { sendOtp, confirmOtp, loading, error } = useOtpAuth()

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await sendOtp(phone)
    if (success) setStep("otp")
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await confirmOtp(phone, otp)
    if (success) {
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Event Host</h1>
          <p className="text-sm text-muted-foreground">Admin Portal</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          {step === "phone" ? (
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

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <h2 className="text-lg font-medium">Verify OTP</h2>
              <p className="text-sm text-muted-foreground">
                Sent to +91 {phone}
              </p>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-background text-sm"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                disabled={loading}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-md text-sm"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-sm text-muted-foreground"
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
