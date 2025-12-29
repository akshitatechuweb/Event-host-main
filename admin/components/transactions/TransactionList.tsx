"use client"

import { TransactionCard } from "./TransactionCard"
import { Transaction } from "@/types/transaction"

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No transactions found for this event.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {transactions.map((transaction) => {
        // Transform backend transaction to component format
        const formattedTransaction = {
          id: transaction._id,
          event: transaction.booking?.items?.map(item => `${item.passType} × ${item.quantity}`).join(", ") || "N/A",
          user: transaction.booking?.buyer?.name || "Guest",
          amount: `₹${transaction.amount.toLocaleString()}`,
          date: new Date(transaction.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          status: transaction.status as "completed" | "pending" | "failed",
        }

        return (
          <TransactionCard key={transaction._id} transaction={formattedTransaction} />
        )
      })}
    </div>
  )
}
