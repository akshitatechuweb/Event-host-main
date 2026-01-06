"use client";

import { TransactionCard } from "./TransactionCard";
import { Transaction } from "@/types/transaction";

interface TransactionListProps {
  transactions: Transaction[];
}

type CardTransactionStatus = "completed" | "pending" | "failed";

type CardTransaction = {
  id: string;
  event: string;
  user: string;
  amount: string;
  date: string;
  status: CardTransactionStatus;
};

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center max-w-sm mx-auto">
        <p className="text-base font-medium text-foreground mb-1">
          No transactions yet
        </p>
        <p className="text-sm text-muted-foreground/60">
          Transactions will appear here once bookings are processed.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {transactions.map((transaction) => {
        // 🔒 KEEPING YOUR TRANSFORMATION LOGIC EXACTLY AS-IS
        const formattedTransaction: CardTransaction = {
          id: transaction._id,
          event: transaction.booking?.items?.length
            ? transaction.booking.items
                .map((item) => `${item.passType} × ${item.quantity}`)
                .join(", ")
            : "N/A",
          user: transaction.booking?.buyer?.name || "Guest",
          amount: `₹${transaction.amount.toLocaleString()}`,
          date: new Date(transaction.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          status:
            transaction.status === "completed"
              ? "completed"
              : transaction.status === "pending"
              ? "pending"
              : "failed",
        };

        return (
          <TransactionCard
            key={transaction._id}
            transaction={formattedTransaction}
          />
        );
      })}
    </div>
  );
}
