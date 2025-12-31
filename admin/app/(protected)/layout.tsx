import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ cookies() is async in Next 15+
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value

  // 1️⃣ No cookie → not authenticated
  if (!accessToken) {
    redirect("/login")
  }

  try {
    // 2️⃣ Validate session + role using existing auth system
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `accessToken=${accessToken}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      redirect("/login")
    }

    const data = await res.json()
    const role = data?.user?.role

    // 3️⃣ Role-based protection
    if (role !== "admin" && role !== "superadmin") {
      redirect("/login")
    }
  } catch {
    redirect("/login")
  }

  // 4️⃣ Authorized → render protected pages
  return <>{children}</>
}
