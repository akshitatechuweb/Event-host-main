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
  const statusColors = {
    active: "bg-chart-1/10 text-chart-1",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-border hover:bg-muted/30 transition-smooth group">
      <div className="text-sm font-medium text-foreground">{event.name}</div>
      <div className="text-sm text-muted-foreground">{event.host}</div>
      <div className="text-sm text-muted-foreground">{event.date}</div>
      <div className="text-sm text-muted-foreground">{event.location}</div>
      <div className="text-sm text-foreground font-medium">{event.attendees}</div>
      <div>
        <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusColors[event.status]}`}>{event.status}</span>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
        <button className="p-1.5 hover:bg-card rounded transition-smooth">
          <Eye className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-1.5 hover:bg-card rounded transition-smooth">
          <Edit2 className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="p-1.5 hover:bg-card rounded transition-smooth">
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      </div>
    </div>
  )
}
