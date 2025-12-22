import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const token = cookies().get("token")

  // 🔒 No token → login
  if (!token) {
    redirect("/login")
  }

  return <>{children}</>
}
