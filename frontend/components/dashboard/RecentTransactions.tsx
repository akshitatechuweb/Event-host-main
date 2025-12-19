"use client"

export function RecentTransactions() {
  const transactions = [
    { id: 1, event: "Summer Music Festival", amount: "$1,200", date: "2 hours ago", status: "completed" },
    { id: 2, event: "Tech Conference 2024", amount: "$850", date: "5 hours ago", status: "completed" },
    { id: 3, event: "Art Gallery Opening", amount: "$450", date: "1 day ago", status: "pending" },
    { id: 4, event: "Food & Wine Expo", amount: "$680", date: "2 days ago", status: "completed" },
  ]

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Latest payment activity</p>
      </div>

      <div className="divide-y divide-border">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="px-6 py-4 hover:bg-muted/30 transition-smooth">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{transaction.event}</p>
                <p className="text-xs text-muted-foreground mt-1">{transaction.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground">{transaction.amount}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-md font-medium ${
                    transaction.status === "completed"
                      ? "bg-chart-1/10 text-chart-1"
                      : "bg-accent/10 text-accent-foreground"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
