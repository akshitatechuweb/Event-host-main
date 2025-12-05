"use client"

import { TransactionCard } from "./TransactionCard"

const dummyTransactions = [
  {
    id: 1,
    userName: "Rahul Kumar",
    eventName: "Tech Conference 2024",
    amount: "₹2,500",
    date: "10 Dec, 2024 - 2:30 PM",
    status: "completed" as const,
    paymentMethod: "UPI"
  },
  {
    id: 2,
    userName: "Priya Singh",
    eventName: "Music Festival",
    amount: "₹1,800",
    date: "9 Dec, 2024 - 5:15 PM",
    status: "completed" as const,
    paymentMethod: "Credit Card"
  },
  {
    id: 3,
    userName: "Amit Patel",
    eventName: "Food Carnival",
    amount: "₹3,200",
    date: "8 Dec, 2024 - 11:45 AM",
    status: "pending" as const,
    paymentMethod: "Net Banking"
  },
  {
    id: 4,
    userName: "Sneha Sharma",
    eventName: "Art Exhibition",
    amount: "₹800",
    date: "7 Dec, 2024 - 3:20 PM",
    status: "completed" as const,
    paymentMethod: "Debit Card"
  },
  {
    id: 5,
    userName: "Vikram Rao",
    eventName: "Tech Conference 2024",
    amount: "₹2,500",
    date: "6 Dec, 2024 - 9:10 AM",
    status: "failed" as const,
    paymentMethod: "UPI"
  },
  {
    id: 6,
    userName: "Anita Desai",
    eventName: "Music Festival",
    amount: "₹1,200",
    date: "5 Dec, 2024 - 6:30 PM",
    status: "completed" as const,
    paymentMethod: "Wallet"
  },
]

export function TransactionList() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {dummyTransactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          userName={transaction.userName}
          eventName={transaction.eventName}
          amount={transaction.amount}
          date={transaction.date}
          status={transaction.status}
          paymentMethod={transaction.paymentMethod}
        />
      ))}
    </div>
  )
}