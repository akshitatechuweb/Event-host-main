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
    <div className="bg-card border border-border rounded-lg p-6 transition-smooth hover:border-muted-foreground/30 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-semibold text-foreground mt-3 tracking-tight">{value}</h3>
          <p className={`text-xs font-medium mt-3 ${isPositive ? "text-chart-1" : "text-destructive"}`}>{change}</p>
        </div>
        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center transition-smooth group-hover:bg-accent">
          <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent-foreground" />
        </div>
      </div>
    </div>
  )
}
