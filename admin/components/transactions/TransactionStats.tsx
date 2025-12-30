"use client"

interface TransactionStatsProps {
  totals: {
    totalRevenue: number
    totalTransactions: number
    totalTickets: number
  }
}

export function TransactionStats({ totals }: TransactionStatsProps) {
  const stats = [
    {
      label: "Total Transactions",
      value: totals.totalTransactions.toLocaleString(),
      accent: false,
    },
    {
      label: "Total Revenue",
      value: `₹${totals.totalRevenue.toLocaleString()}`,
      accent: true,
    },
    {
      label: "Tickets Sold",
      value: totals.totalTickets.toLocaleString(),
      accent: false,
    },
    {
      label: "Avg Transaction",
      value:
        totals.totalTransactions > 0
          ? `₹${Math.round(
              totals.totalRevenue / totals.totalTransactions
            ).toLocaleString()}`
          : "₹0",
      accent: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`
            rounded-xl p-6
            transition-all duration-300
            ${
              stat.accent
                ? "bg-chart-1/10 border border-chart-1/20 hover:border-chart-1/30 hover:shadow-sm hover:shadow-chart-1/10"
                : "bg-card border border-border/50 hover:border-border hover:shadow-sm hover:shadow-black/5"
            }
          `}
        >
          {/* Label */}
          <p className="text-xs uppercase tracking-wider text-muted-foreground/60">
            {stat.label}
          </p>

          {/* Value */}
          <p
            className={`mt-3 text-2xl font-semibold tracking-tight ${
              stat.accent ? "text-chart-1" : "text-foreground/90"
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
