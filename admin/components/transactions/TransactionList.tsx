"use client"

import { TransactionCard } from "./TransactionCard"

export function TransactionList() {
  const transactions = [
    {
      id: "1",
      event: "Summer Music Festival",
      user: "Alice Johnson",
      amount: "$150",
      date: "Dec 15, 2024",
      status: "completed" as const,
    },
    {
      id: "2",
      event: "Tech Conference 2024",
      user: "Bob Smith",
      amount: "$200",
      date: "Dec 14, 2024",
      status: "completed" as const,
    },
    {
      id: "3",
      event: "Art Gallery Opening",
      user: "Carol White",
      amount: "$50",
      date: "Dec 13, 2024",
      status: "pending" as const,
    },
    {
      id: "4",
      event: "Food & Wine Expo",
      user: "David Brown",
      amount: "$100",
      date: "Dec 12, 2024",
      status: "failed" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {transactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </div>
  )
}
