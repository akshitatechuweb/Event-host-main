"use client"

import { CreditCard, Calendar, User, Ticket } from "lucide-react"

interface TransactionCardProps {
  userName: string
  eventName: string
  amount: string
  date: string
  status: "completed" | "pending" | "failed"
  paymentMethod: string
}

export function TransactionCard({ 
  userName, 
  eventName, 
  amount, 
  date, 
  status,
  paymentMethod 
}: TransactionCardProps) {
  const statusConfig = {
    completed: { bgColor: "bg-green-100", textColor: "text-green-700", text: "Completed" },
    pending: { bgColor: "bg-yellow-100", textColor: "text-yellow-700", text: "Pending" },
    failed: { bgColor: "bg-red-100", textColor: "text-red-700", text: "Failed" }
  }

  const config = statusConfig[status]

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{userName}</h3>
          <p className="text-sm text-gray-600 mt-1">{eventName}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
          {config.text}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm">{paymentMethod}</span>
          </div>
          <span className="text-xl font-bold text-indigo-600">{amount}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
      </div>
    </div>
  )
}