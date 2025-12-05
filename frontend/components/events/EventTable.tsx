"use client"

import { EventTableHeader } from "./EventTableHeader"
import { EventTableRow } from "./EventTableRow"

const dummyEvents = [
  { 
    id: 1, 
    name: "Tech Conference 2024", 
    host: "John Doe", 
    date: "15 Dec, 2024", 
    location: "Mumbai", 
    attendees: 150, 
    maxAttendees: 200, 
    status: "active" as const 
  },
  { 
    id: 2, 
    name: "Music Festival", 
    host: "Jane Smith", 
    date: "20 Dec, 2024", 
    location: "Delhi", 
    attendees: 300, 
    maxAttendees: 500, 
    status: "active" as const 
  },
  { 
    id: 3, 
    name: "Food Carnival", 
    host: "Mike Johnson", 
    date: "25 Dec, 2024", 
    location: "Bangalore", 
    attendees: 892, 
    maxAttendees: 1000, 
    status: "pending" as const 
  },
  { 
    id: 4, 
    name: "Art Exhibition", 
    host: "Sarah Williams", 
    date: "28 Dec, 2024", 
    location: "Pune", 
    attendees: 452, 
    maxAttendees: 500, 
    status: "active" as const 
  },
  { 
    id: 5, 
    name: "Sports Meet 2024", 
    host: "David Brown", 
    date: "10 Nov, 2024", 
    location: "Hyderabad", 
    attendees: 250, 
    maxAttendees: 250, 
    status: "completed" as const 
  },
]

export function EventTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <EventTableHeader />
      <div>
        {dummyEvents.map((event) => (
          <EventTableRow
            key={event.id}
            name={event.name}
            host={event.host}
            date={event.date}
            location={event.location}
            attendees={event.attendees}
            maxAttendees={event.maxAttendees}
            status={event.status}
          />
        ))}
      </div>
      
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
        <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Previous
        </button>
        <span className="text-sm text-gray-600">Page 1 of 1</span>
        <button className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          Next
        </button>
      </div>
    </div>
  )
}