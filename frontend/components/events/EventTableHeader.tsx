"use client"

export function EventTableHeader() {
  return (
    <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-muted/30 border-b border-border">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Event Name</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Host</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Attendees</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</div>
    </div>
  )
}
