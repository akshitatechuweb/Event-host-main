"use client"

import { Sidebar } from "../common/Sidebar"
import type { ReactNode } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div className="backdrop-blur-xl bg-white/40 border-r border-white/40 shadow-sm">
        <Sidebar />
      </div>

      <main className="flex-1 ml-60 overflow-y-auto">
        <div className="p-8 animate-in fade-in duration-300 ease-out">
          {children}
        </div>
      </main>
    </div>
  )
}
