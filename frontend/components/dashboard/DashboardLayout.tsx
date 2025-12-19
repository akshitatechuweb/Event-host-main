"use client"

import { Sidebar } from "../common/Sidebar"
import type { ReactNode } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-gradient)]">
      <Sidebar />

      <main className="flex-1 ml-60 overflow-y-auto">
        <div className="p-8 animate-in fade-in duration-300">
          {children}
        </div>
      </main>
    </div>
  )
}
