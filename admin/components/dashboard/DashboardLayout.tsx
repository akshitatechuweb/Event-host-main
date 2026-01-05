"use client"

import { Sidebar } from "../common/Sidebar"
import type { ReactNode } from "react"

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1">
      <div className="max-w-[1440px] mx-auto px-10 py-10">
        {children}
      </div>
    </div>
  );
}

