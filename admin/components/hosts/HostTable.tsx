"use client"

import { HostTableHeader } from "./HostTableHeader"
import { HostTableRow } from "./HostTableRow"

export interface Host {
  _id: string
  userName: string
  phone: string
  city: string
  preferredPartyDate: string
  status: "pending" | "approved" | "rejected"
}

interface HostTableProps {
  hosts: Host[]
}

export function HostTable({ hosts }: HostTableProps) {
  if (!hosts || hosts.length === 0) {
    return (
      <div className="
        rounded-2xl bg-white dark:bg-black/40
        border border-border p-6 text-center
      ">
        No hosts found
      </div>
    )
  }

  return (
    <div
      className="
        rounded-2xl overflow-hidden
        bg-white dark:bg-black/40
        border border-border
        shadow-[0_25px_70px_rgba(0,0,0,0.12)]
      "
    >
      <HostTableHeader />
      {hosts.map((host) => (
        <HostTableRow key={host._id} host={host} />
      ))}
    </div>
  )
}
