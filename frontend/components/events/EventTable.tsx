"use client"

import { EventTableHeader } from "./EventTableHeader"
import { EventTableRow } from "./EventTableRow"

export function EventTable() {
  const events = [
    {
      name: "Summer Music Festival",
      host: "John Doe",
      date: "Jul 15, 2024",
      location: "Central Park",
      attendees: 450,
      status: "active" as const,
    },
    {
      name: "Tech Conference 2024",
      host: "Jane Smith",
      date: "Aug 22, 2024",
      location: "Convention Center",
      attendees: 320,
      status: "active" as const,
    },
    {
      name: "Art Gallery Opening",
      host: "Mike Johnson",
      date: "Sep 10, 2024",
      location: "Downtown Gallery",
      attendees: 180,
      status: "completed" as const,
    },
    {
      name: "Food & Wine Expo",
      host: "Sarah Williams",
      date: "Oct 5, 2024",
      location: "Harbor View",
      attendees: 280,
      status: "active" as const,
    },
  ]

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <EventTableHeader />
      <div>
        {events.map((event, index) => (
          <EventTableRow key={index} event={event} />
        ))}
      </div>
    </div>
  )
}
