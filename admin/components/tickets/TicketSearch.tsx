"use client"

import { Search, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TicketSearch() {
  return (
    <div className="flex gap-3 items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by event, pass type..."
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border/60 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring/60 transition-all duration-150"
        />
      </div>
      
    </div>
  )
}
