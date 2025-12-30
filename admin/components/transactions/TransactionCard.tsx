"use client"

import { ArrowRight } from "lucide-react"

interface TransactionCardProps {
  transaction: {
    id: string
    event: string
    user: string
    amount: string
    date: string
    status: "completed" | "pending" | "failed"
  }
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const statusMap = {
    completed: {
      label: "Completed",
      dot: "bg-emerald-500",
      text: "text-emerald-600",
    },
    pending: {
      label: "Pending",
      dot: "bg-amber-500",
      text: "text-amber-600",
    },
    failed: {
      label: "Failed",
      dot: "bg-destructive",
      text: "text-destructive",
    },
  }

  const status = statusMap[transaction.status]

  return (
    <div
      className="
        group relative
        rounded-xl
        bg-card
        border border-border/50
        p-6
        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:shadow-lg hover:shadow-black/10
      "
    >
      {/* Subtle hover wash */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />

      <div className="relative flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-sm font-medium text-foreground truncate">
            {transaction.event}
          </h3>

          {/* Status */}
          <div className={`flex items-center gap-2 text-xs font-medium ${status.text}`}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            <span className="whitespace-nowrap">{status.label}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm text-muted-foreground truncate">
              {transaction.user}
            </p>

            <p className="text-lg font-semibold tabular-nums text-foreground">
              {transaction.amount}
            </p>
          </div>

          <p className="text-xs text-muted-foreground/60">
            {transaction.date}
          </p>
        </div>
      </div>
    </div>
  )
}
