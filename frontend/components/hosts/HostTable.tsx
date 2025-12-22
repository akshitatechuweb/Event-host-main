"use client"

import { HostTableHeader } from "./HostTableHeader"
import { HostTableRow } from "./HostTableRow"

export function HostTable() {
  const hosts = [
    {
      id: "1",
      userName: "John Doe",
      phone: "9999999999",
      city: "Delhi",
      preferredPartyDate: "2025-02-15",
      status: "pending" as const,
    },
    {
      id: "2",
      userName: "Jane Smith",
      phone: "8888888888",
      city: "Mumbai",
      preferredPartyDate: "2025-02-20",
      status: "approved" as const,
    },
  ]

  return (
    <div className="
      rounded-2xl overflow-hidden
      bg-white dark:bg-black/40
      border border-border
      shadow-[0_25px_70px_rgba(0,0,0,0.12)]
    ">
      <HostTableHeader />
      {hosts.map((host) => (
        <HostTableRow key={host.id} host={host} />
      ))}
    </div>
  )
}
