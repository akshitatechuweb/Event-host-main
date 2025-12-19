"use client"

import { HostTableHeader } from "./HostTableHeader"
import { HostTableRow } from "./HostTableRow"

export function HostTable() {
  const hosts = [
    {
      name: "John Doe",
      email: "john@example.com",
      eventsHosted: 12,
      totalRevenue: "$15,400",
      status: "active" as const,
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      eventsHosted: 8,
      totalRevenue: "$12,200",
      status: "active" as const,
    },
    {
      name: "Mike Johnson",
      email: "mike@example.com",
      eventsHosted: 5,
      totalRevenue: "$8,500",
      status: "pending" as const,
    },
    {
      name: "Sarah Williams",
      email: "sarah@example.com",
      eventsHosted: 15,
      totalRevenue: "$22,800",
      status: "active" as const,
    },
  ]

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <HostTableHeader />
      <div>
        {hosts.map((host, index) => (
          <HostTableRow key={index} host={host} />
        ))}
      </div>
    </div>
  )
}
