"use client"

import { Search } from "lucide-react"

export function EventSearch() {
  return (
    <div className="px-6 py-4 border-b border-border">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search events"
          className="
            h-9 w-full pl-9 pr-3
            rounded-md
            bg-background
            border border-border
            text-sm
            focus:outline-none
            focus:ring-2 focus:ring-primary/20
          "
        />
      </div>
    </div>
  )
}

