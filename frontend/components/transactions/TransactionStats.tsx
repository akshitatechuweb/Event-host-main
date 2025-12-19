"use client"

export function TransactionStats() {
  const stats = [
    { label: "Total Transactions", value: "1,234" },
    { label: "Total Volume", value: "$123,456" },
    { label: "Success Rate", value: "98.5%" },
    { label: "Avg. Transaction", value: "$100" },
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
