"use client"

interface TicketTableRowProps {
  ticket: {
    eventName: string
    ticketType: string
    price: string
    total: number
    sold: number
    available: number
    status: "on sale" | "sold out" | "upcoming"
  }
}

export function TicketTableRow({ ticket }: TicketTableRowProps) {
  const statusColors = {
    "on sale": "bg-chart-1/10 text-chart-1",
    "sold out": "bg-destructive/10 text-destructive",
    upcoming: "bg-accent/10 text-accent-foreground",
  }

  return (
    <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-border hover:bg-muted/30 transition-smooth">
      <div className="text-sm font-medium text-foreground">{ticket.eventName}</div>
      <div className="text-sm text-muted-foreground">{ticket.ticketType}</div>
      <div className="text-sm text-foreground font-medium">{ticket.price}</div>
      <div className="text-sm text-muted-foreground">{ticket.total}</div>
      <div className="text-sm text-foreground font-medium">{ticket.sold}</div>
      <div className="text-sm text-muted-foreground">{ticket.available}</div>
      <div>
        <span className={`text-xs px-2 py-1 rounded-md font-medium ${statusColors[ticket.status]}`}>
          {ticket.status}
        </span>
      </div>
    </div>
  )
}
