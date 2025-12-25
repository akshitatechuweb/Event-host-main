"use client"

import { Eye, Edit2, Trash2 } from "lucide-react"

interface UserTableRowProps {
  user: {
    name: string
    email: string
    role: string
    eventsAttended: number
    status: "active" | "inactive" | "banned"
  }
}

export function UserTableRow({ user }: UserTableRowProps) {
  const statusColors = {
    active: "bg-chart-1/10 text-chart-1",
    inactive: "bg-muted text-muted-foreground",
    banned: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-border hover:bg-muted/30 transition-smooth group">
      <div className="text-sm font-medium text-foreground">{user.name}</div>
      <div className="text-sm text-muted-foreground">{user.email}</div>
      <div className="text-sm text-muted-foreground">{user.role}</div>
      <div className="text-sm text-foreground font-medium">{user.eventsAttended}</div>
      <div>
        <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusColors[user.status]}`}>{user.status}</span>
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
