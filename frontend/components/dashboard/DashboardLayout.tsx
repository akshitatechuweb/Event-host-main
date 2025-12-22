"use client"

import { Sidebar } from "../common/Sidebar"
import type { ReactNode } from "react"

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--bg-gradient)]">
      <Sidebar />

      <main className="flex-1 ml-60 overflow-y-auto">
        {/* SINGLE source of spacing */}
        <div className="max-w-[1440px] mx-auto px-10 py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
