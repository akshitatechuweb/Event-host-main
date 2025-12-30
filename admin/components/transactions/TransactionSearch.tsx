"use client"

import { Search, X } from "lucide-react"
import { useState } from "react"

export function TransactionSearch() {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative max-w-md">
      {/* Search icon */}
      <Search
        className={`
          absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4
          transition-colors duration-200
          ${focused ? "text-foreground" : "text-muted-foreground/60"}
        `}
      />

      {/* Input */}
      <input
        type="text"
        placeholder="Search transactions…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="
          w-full
          h-10
          pl-10 pr-9
          rounded-lg
          bg-card
          border border-border/50
          text-sm text-foreground
          placeholder:text-muted-foreground/50
          transition-all duration-200
          focus:outline-none
          focus:border-border
          focus:ring-1 focus:ring-foreground/5
          hover:border-border
        "
      />

      {/* Clear */}
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            p-0.5
            text-muted-foreground/60
            hover:text-foreground
            transition-colors duration-150
          "
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
