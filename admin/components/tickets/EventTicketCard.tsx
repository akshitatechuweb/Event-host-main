"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, TrendingUp } from "lucide-react"
import { TicketBreakdownTable } from "./TicketBreakdownTable"

interface Pass {
  ticketType: string
  price: number
  total: number
  sold: number
  available: number
}

export function EventTicketCard({
  eventName,
  passes,
}: {
  eventName: string
  passes: Pass[]
}) {
  const [open, setOpen] = useState(false)

  // ✅ SAFE AGGREGATIONS
  const totalSold = passes.reduce(
    (sum, p) => sum + (Number(p.sold) || 0),
    0
  )

  const totalCapacity = passes.reduce(
    (sum, p) => sum + (Number(p.total) || 0),
    0
  )

  const revenue = passes.reduce((sum, p) => {
    const sold = Number(p.sold)
    const price = Number(p.price)

    if (Number.isNaN(sold) || Number.isNaN(price)) return sum
    return sum + sold * price
  }, 0)

  const soldPercent =
    totalCapacity === 0
      ? 0
      : Math.round((totalSold / totalCapacity) * 100)

  const demandStatus =
    totalCapacity > 0 && totalSold >= totalCapacity
      ? "Sold Out"
      : soldPercent >= 80
        ? "Almost Full"
        : "Selling"

  return (
    <div className="bg-card border border-border/40 rounded-xl transition-all hover:border-border/60">
      {/* HEADER */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        className="flex justify-between items-start gap-6 p-6 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring rounded-xl"
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">
            {eventName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {totalSold} / {totalCapacity} tickets sold
          </p>
        </div>

        <div className="flex items-center gap-10">
          {/* Revenue */}
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Revenue
            </p>
            <p className="text-base font-semibold text-foreground tabular-nums">
              ₹{revenue.toLocaleString("en-IN")}
            </p>
          </div>

          {/* Status */}
          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                demandStatus === "Sold Out"
                  ? "bg-red-500/10 text-red-600"
                  : demandStatus === "Almost Full"
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-green-500/10 text-green-600"
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              {demandStatus}
            </span>

            {open ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* EXPAND */}
      {open && (
        <div className="px-6 pb-6 pt-2 border-t border-border/30 animate-in fade-in slide-in-from-top-1">
          <TicketBreakdownTable passes={passes} />
        </div>
      )}
    </div>
  )
}
