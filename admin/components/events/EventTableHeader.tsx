"use client"

export function EventTableHeader() {
  return (
    <div className="
      grid grid-cols-7 gap-4
      px-6 py-3
      text-xs uppercase tracking-wide
      text-muted-foreground
      bg-muted/40
    ">
      <div>Event</div>
      <div>Host</div>
      <div>Date</div>
      <div>Location</div>
      <div>Attendees</div>
      <div>Status</div>
      <div className="text-right">Actions</div>
    </div>
  )
}
