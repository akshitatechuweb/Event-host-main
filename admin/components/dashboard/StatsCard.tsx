"use client"

import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: LucideIcon
}

export function StatsCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
}: StatsCardProps) {
  return (
    <div className="stats-gradient premium-card rounded-2xl p-6 transition-smooth hover:-translate-y-0.5">
      <div className="flex justify-between relative z-10">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-semibold">
            {value}
          </h3>
          <p
            className={`mt-2 text-xs ${
              isPositive ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {change}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 backdrop-blur">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}
