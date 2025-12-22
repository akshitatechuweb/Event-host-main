"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"

export function RecentTransactions() {
  const transactions = [
    { id: 1, event: "Summer Music Festival", amount: "$1,200", date: "2 hours ago", status: "completed" },
    { id: 2, event: "Tech Conference 2024", amount: "$850", date: "5 hours ago", status: "completed" },
    { id: 3, event: "Art Gallery Opening", amount: "$450", date: "1 day ago", status: "pending" },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-lg font-semibold tracking-tight">
          Recent Transactions
        </h2>
        <p className="text-sm text-muted-foreground">
          Latest payment activity
        </p>
      </div>

      {/* List */}
      <div className="divide-y divide-border">
        {transactions.map((t) => {
          const isCompleted = t.status === "completed"

          return (
            <div
              key={t.id}
              className="
                group relative px-6 py-4
                transition-all duration-200
                hover:bg-muted/30
              "
            >
              {/* Left accent bar */}
              <span
                className="
                  absolute left-0 top-0 h-full w-0.5
                  bg-gradient-to-b from-pink-400 to-violet-400
                  opacity-0 group-hover:opacity-100
                  transition-opacity
                "
              />

              <div className="flex items-center justify-between gap-4">

                {/* Left */}
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {t.event}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.date}
                  </p>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">

                  {/* Amount */}
                  <div className="text-right">
                    <p className="font-semibold tabular-nums text-foreground">
                      {t.amount}
                    </p>
                  </div>

                  {/* Status */}
                  <span
                    className={`
                      inline-flex items-center gap-1.5
                      rounded-full px-3 py-1
                      text-xs font-medium capitalize
                      backdrop-blur-md
                      ${
                        isCompleted
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-amber-500/10 text-amber-500"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {t.status}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
