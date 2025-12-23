"use client"

import { Eye, Check, X } from "lucide-react"
import type { Host } from "./HostTable"

export function HostTableRow({ host }: { host: Host }) {
  const statusStyles = {
    pending: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400",
    approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
  }

  return (
    <div
      className="
        grid grid-cols-6 gap-4 px-6 py-5
        border-b border-border
        hover:bg-muted/40 transition
      "
    >
      <div>
        <p className="font-medium">{host.userName}</p>
        <p className="text-xs text-muted-foreground">{host.phone}</p>
      </div>

      <div>{host.city}</div>

      <div>
        {new Date(host.preferredPartyDate).toLocaleDateString()}
      </div>

      <div>
        <span
          className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyles[host.status]}`}
        >
          {host.status}
        </span>
      </div>

      {/* ACTIONS — ALWAYS VISIBLE */}
      <div className="flex justify-center gap-2">
        <button className="icon-btn">
          <Eye className="w-4 h-4" />
        </button>

        {host.status === "pending" && (
          <>
            <button className="icon-btn text-emerald-500">
              <Check className="w-4 h-4" />
            </button>
            <button className="icon-btn text-red-500">
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
