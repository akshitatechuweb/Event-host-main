import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ cookies() is async in App Router
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  // 🔐 No token → login
  if (!token) {
    redirect("/login")
  }

  return <>{children}</>
}
