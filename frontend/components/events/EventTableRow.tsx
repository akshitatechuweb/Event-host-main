"use client"

import { MoreVertical, Calendar, MapPin } from "lucide-react"

interface EventTableRowProps {
  name: string
  host: string
  date: string
  location: string
  attendees: number
  maxAttendees: number
  status: "active" | "pending" | "completed" | "cancelled"
}

export function EventTableRow({ 
  name, 
  host, 
  date, 
  location, 
  attendees, 
  maxAttendees, 
  status 
}: EventTableRowProps) {
  const statusConfig = {
    active: { bgColor: "bg-green-100", textColor: "text-green-700", text: "Active" },
    pending: { bgColor: "bg-yellow-100", textColor: "text-yellow-700", text: "Pending" },
    completed: { bgColor: "bg-blue-100", textColor: "text-blue-700", text: "Completed" },
    cancelled: { bgColor: "bg-red-100", textColor: "text-red-700", text: "Cancelled" }
  }

  const config = statusConfig[status]

  return (
    <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-indigo-50/50 transition-colors items-center">
      <div className="font-medium text-gray-900">{name}</div>
      <div className="text-gray-600">{host}</div>
      <div className="flex items-center gap-2 text-gray-600">
        <Calendar className="h-4 w-4" />
        <span className="text-sm">{date}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <MapPin className="h-4 w-4" />
        <span className="text-sm">{location}</span>
      </div>
      <div className="text-gray-900">
        <span className="font-semibold">{attendees}</span>
        <span className="text-gray-500">/{maxAttendees}</span>
      </div>
      <div>
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