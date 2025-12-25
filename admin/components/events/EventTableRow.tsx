"use client"

import { Eye, Edit2, Trash2 } from "lucide-react"

interface EventTableRowProps {
  event: {
    name: string
    host: string
    date: string
    location: string
    attendees: number
    status: "active" | "completed" | "cancelled"
  }
}

export function EventTableRow({ event }: EventTableRowProps) {
  const status = {
    active: "bg-emerald-500/10 text-emerald-600",
    completed: "bg-slate-500/10 text-slate-500",
    cancelled: "bg-red-500/10 text-red-500",
  }

  return (
    <div className="
      grid grid-cols-7 gap-4
      px-6 py-4
      hover:bg-muted/30
    ">
      <div className="font-medium">{event.name}</div>
      <div className="text-muted-foreground">{event.host}</div>
      <div className="text-muted-foreground">{event.date}</div>
      <div className="text-muted-foreground">{event.location}</div>
      <div className="font-medium">{event.attendees}</div>

      <div>
        <span className={`px-3 py-1 rounded-full text-xs ${status[event.status]}`}>
          {event.status}
        </span>
      </div>

      <div className="flex justify-end gap-2">
        <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
        <Trash2 className="w-4 h-4 text-destructive cursor-pointer" />
      </div>
    </div>
  )
}
