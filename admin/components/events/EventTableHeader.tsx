"use client"

export function EventTableHeader() {
  return (
    <div className="
      grid grid-cols-[64px_2fr_1.5fr_1fr_1fr_1fr] gap-4
      px-6 py-3
      text-xs uppercase tracking-wide
      text-muted-foreground
      bg-muted/40
    ">
      <div className="col-span-2">Event</div>
      <div>Location</div>
      <div>Date</div>
      <div>Attendees</div>
      <div className="text-right">Actions</div>
    </div>
  )
}
