"use client"
import React, { useState } from "react"
import { Phone, Lock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import api from "@/lib/api"

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
    setPhone(digits)
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4)
    setOtp(digits)
  }

  const sendOtp = async () => {
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit number")
      return
    }

    setLoading(true)
    setError("")

    try {
      await api.post("/auth/request-otp", { phone })
      setStep("otp")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (otp.length !== 4) {
      setError("Please enter 4-digit OTP")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await api.post("/auth/verify-otp", { phone, otp })
      if (res.data.success) {
        router.push("/dashboard")
      } else {
        setError(res.data.message || "Invalid OTP")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-linear-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-linear-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 mx-auto flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">EH</span>
            </div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-4">
              Event Host Admin
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              {step === "phone" ? "Enter your phone number" : "Enter the OTP"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">

            {/* Phone Step */}
            {step === "phone" && (
              <div className="space-y-5">

                {/* Phone Input */}
                <div className="relative flex items-center">
                  <Phone className="absolute left-4 w-5 h-5 text-indigo-500 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/60 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-lg placeholder-gray-400"
                  />
                </div>

                {/* Button */}
                <button
                  onClick={sendOtp}
                  disabled={loading || phone.length !== 10}
                  className="w-full bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-70"
                >
                  {loading ? "Sending OTP..." : "Get OTP"}
                </button>
              </div>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <div className="space-y-5">

                {/* OTP Input */}
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-5 h-5 text-indigo-500 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="••••"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={4}
                    className="w-full pl-12 pr-4 py-3 bg-white/60 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none text-center text-3xl tracking-widest font-mono placeholder-gray-400"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStep("phone")
                      setOtp("")
                      setError("")
                    }}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <button
                    onClick={verifyOtp}
                    disabled={loading || otp.length !== 4}
                    className="flex-1 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:scale-105 disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Login"}
                  </button>
                </div>

                <p className="text-center text-sm text-gray-600">
                  OTP sent to <span className="font-semibold">{phone}</span>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
