"use client"

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
  const statusColors = {
    completed: "bg-chart-1/10 text-chart-1",
    pending: "bg-accent/10 text-accent-foreground",
    failed: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-muted-foreground/30 transition-smooth">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground">{transaction.event}</h3>
          <p className="text-sm text-muted-foreground mt-1">{transaction.user}</p>
          <p className="text-xs text-muted-foreground mt-2">{transaction.date}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-foreground">{transaction.amount}</p>
          <span
            className={`inline-block text-xs px-2 py-1 rounded-md font-medium mt-2 ${statusColors[transaction.status]}`}
          >
            {transaction.status}
          </span>
        </div>
      </div>
    </div>
  )
}
