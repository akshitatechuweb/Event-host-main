"use client"

interface TicketTableRowProps {
  ticket: {
    eventName: string
    ticketType: string
    price: string
    total: number
    sold: number
    available: number
  }
}

export function TicketTableRow({ ticket }: TicketTableRowProps) {
  return (
    <div className="grid grid-cols-7 gap-4 px-4 py-3.5 border-t border-border/20 text-sm hover:bg-muted/10 transition-all">
      <div className="text-sm font-medium text-foreground">{ticket.eventName}</div>
      <div className="text-sm text-muted-foreground">{ticket.ticketType}</div>
      <div className="text-sm text-foreground font-medium">{ticket.price}</div>
      <div className="text-sm text-muted-foreground">{ticket.total}</div>
      <div className="text-sm text-foreground font-medium">{ticket.sold}</div>
      <div className="text-sm text-muted-foreground">{ticket.available}</div>
    </div>
  )
}
