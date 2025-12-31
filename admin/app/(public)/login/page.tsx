import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import LoginPage from "@/components/pages/LoginPage"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default async function LoginPageRoute() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value

  if (accessToken) {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "GET",
        headers: {
          Cookie: `accessToken=${accessToken}`,
        },
        cache: "no-store",
      })

      if (res.ok) {
        const data = await res.json()
        const role = data?.user?.role

        // Already logged-in admin → go to dashboard
        if (role === "admin" || role === "superadmin") {
          redirect("/dashboard")
        }
      }
    } catch {
      // Ignore errors → allow login page to render
    }
  }

  // Not logged in → show login
  return <LoginPage />
}
