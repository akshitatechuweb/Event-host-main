"use client"

export function TicketTableHeader() {
  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-muted/30 border-b border-border">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Name</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ticket Type</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sold</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available</div>
    </div>
  )
}
