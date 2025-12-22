"use client"

import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"

export function useLogout() {
  const router = useRouter()

  const handleLogout = async () => {
    // Clear backend session / cookie
    await logout()

    // Clear any client-side tokens (safe even if unused)
    localStorage.clear()
    sessionStorage.clear()

    // Redirect to login
    router.replace("/login")
  }

  return { handleLogout }
}
