// "use client"

// import { useRouter } from "next/navigation"
// import { useEffect, useState } from "react"
// // import api from "@/lib/api"

// export default function ProtectedRoute({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   const router = useRouter()
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const verifyAuth = async () => {
//       try {
//         // Simple auth check
//         await api.get("/auth/me")
//         setLoading(false)
//       } catch {
//         router.replace("/login")
//       }
//     }

//     verifyAuth()
//   }, [router])

//   if (loading) return null

//   return <>{children}</>
// }
