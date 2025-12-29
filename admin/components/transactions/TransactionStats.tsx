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
    { label: "Total Transactions", value: totals.totalTransactions.toLocaleString() },
    { label: "Total Revenue", value: `₹${totals.totalRevenue.toLocaleString()}` },
    { label: "Tickets Sold", value: totals.totalTickets.toLocaleString() },
    { label: "Avg. Transaction", value: totals.totalTransactions > 0 ? `₹${Math.round(totals.totalRevenue / totals.totalTransactions).toLocaleString()}` : "₹0" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          <p className="text-2xl font-semibold text-foreground mt-2 tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}
