import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[var(--surface-gradient)] text-card-foreground border border-border/40",
        "shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)]",
        "transition-shadow",
        className
      )}
      {...props}
    />
  )
}

export { Card }
