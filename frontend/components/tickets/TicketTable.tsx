"use client"

import { TicketTableHeader } from "./TicketTableHeader"
import { TicketTableRow } from "./TicketTableRow"

export function TicketTable() {
  const tickets = [
    {
      eventName: "Summer Music Festival",
      ticketType: "VIP",
      price: "$150",
      total: 100,
      sold: 85,
      available: 15,
      status: "on sale" as const,
    },
    {
      eventName: "Summer Music Festival",
      ticketType: "General",
      price: "$75",
      total: 300,
      sold: 300,
      available: 0,
      status: "sold out" as const,
    },
    {
      eventName: "Tech Conference 2024",
      ticketType: "Early Bird",
      price: "$200",
      total: 150,
      sold: 120,
      available: 30,
      status: "on sale" as const,
    },
    {
      eventName: "Art Gallery Opening",
      ticketType: "Standard",
      price: "$50",
      total: 200,
      sold: 0,
      available: 200,
      status: "upcoming" as const,
    },
  ]

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <TicketTableHeader />
      <div>
        {tickets.map((ticket, index) => (
          <TicketTableRow key={index} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
