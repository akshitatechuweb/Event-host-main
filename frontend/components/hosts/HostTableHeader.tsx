"use client"

export function HostTableHeader() {
  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-3 bg-muted/30 border-b border-border">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Host Name</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Events Hosted</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</div>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</div>
    </div>
  )
}
