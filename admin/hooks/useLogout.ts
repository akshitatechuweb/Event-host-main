"use client"

import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"

export function useLogout() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // 1️⃣ Clear backend cookie/session
      await logout()
    } catch {
      // Ignore errors — still force logout on client
    }

    // 2️⃣ Clear any client-side storage (safe even if unused)
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {}

    // 3️⃣ Replace history to prevent back navigation
    router.replace("/login")
  }

  return { handleLogout }
}
