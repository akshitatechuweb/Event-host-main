"use client"

import { LogOut } from "lucide-react"
import { useLogout } from "@/hooks/useLogout"

export function SidebarFooter() {
  const { handleLogout } = useLogout()

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
                 text-muted-foreground hover:bg-sidebar-accent/50
                 hover:text-sidebar-foreground transition w-full"
    >
      <LogOut className="w-4 h-4" />
      <span>Sign Out</span>
    </button>
  )
}
