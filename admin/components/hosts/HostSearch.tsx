"use client"

import { Search } from "lucide-react"

export function HostSearch() {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search hosts..."
        className="
          w-full h-11 pl-11 pr-4 rounded-xl
          bg-white dark:bg-black/40
          border border-border
          text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-violet-400/40
          transition
        "
      />
    </div>
  )
}
