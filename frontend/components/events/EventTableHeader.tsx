"use client"

export function EventTableHeader() {
  return (
    <div className="grid grid-cols-7 gap-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-xl font-semibold">
      <div>Event Name</div>
      <div>Host</div>
      <div>Date</div>
      <div>Location</div>
      <div>Attendees</div>
      <div>Status</div>
      <div>Actions</div>
    </div>
  )
}