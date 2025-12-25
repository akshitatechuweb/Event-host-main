import { apiFetch } from "./api"

export const requestOtp = async (phone: string) => {
  return apiFetch("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  })
}

export const verifyOtp = async (phone: string, otp: string) => {
  return apiFetch("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  })
}

export const logout = async () => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
  } catch {
    // even if backend fails, frontend should still log out
  }
}
