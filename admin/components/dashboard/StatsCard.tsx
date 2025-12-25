"use client"

import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: LucideIcon
}

export function StatsCard({ title, value, change, isPositive, icon: Icon }: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-xl p-6 transition hover:-translate-y-0.5">
      <div className="flex justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-semibold mt-2">{value}</h3>
          <p className={`text-xs mt-2 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {change}
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

