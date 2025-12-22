import { useState } from "react"
import { requestOtp, verifyOtp } from "@/lib/auth"

export function useOtpAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendOtp = async (phone: string) => {
    try {
      setLoading(true)
      setError(null)
      await requestOtp(phone)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const confirmOtp = async (phone: string, otp: string) => {
    try {
      setLoading(true)
      setError(null)
      await verifyOtp(phone, otp)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { sendOtp, confirmOtp, loading, error }
}
