"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/useLogout"

export function LogoutSection() {
  const { logout, loading } = useLogout()

  const handleLogout = () => {
    void logout()
  }

  return (
    <div className="border-t border-purple-200 p-4 bg-white/40 backdrop-blur-xl shadow-inner">
      <Button
        onClick={handleLogout}
        variant="outline"
        className="
          w-full justify-start gap-2 
          font-medium rounded-lg
          text-red-600 border-red-300
          hover:bg-linear-to-r hover:from-red-100 hover:to-red-50
          transition-all duration-200
        "
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    </div>
  )
}
