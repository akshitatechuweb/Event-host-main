"use client"

import { MoreVertical, CheckCircle, Clock, XCircle } from "lucide-react"

interface HostTableRowProps {
  name: string
  email: string
  eventsHosted: number
  revenue: string
  status: "approved" | "pending" | "rejected"
}

export function HostTableRow({ name, email, eventsHosted, revenue, status }: HostTableRowProps) {
  const statusConfig = {
    approved: {
      icon: CheckCircle,
      text: "Approved",
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      iconColor: "text-green-500"
    },
    pending: {
      icon: Clock,
      text: "Pending",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-700",
      iconColor: "text-yellow-500"
    },
    rejected: {
      icon: XCircle,
      text: "Rejected",
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      iconColor: "text-red-500"
    }
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-indigo-50/50 transition-colors items-center">
      <div className="font-medium text-gray-900">{name}</div>
      <div className="text-gray-600">{email}</div>
      <div className="text-gray-900 font-medium">{eventsHosted}</div>
      <div className="text-gray-900 font-semibold">{revenue}</div>
      <div className="flex items-center gap-2">
        <StatusIcon className={`h-5 w-5 ${config.iconColor}`} />
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
          {config.text}
        </span>
      </div>
      <div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}