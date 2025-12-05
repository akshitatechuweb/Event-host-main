"use client"

export function TicketTableHeader() {
  return (
    <div className="grid grid-cols-7 gap-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-xl font-semibold">
      <div>Event Name</div>
      <div>Ticket Type</div>
      <div>Price</div>
      <div>Total</div>
      <div>Sold</div>
      <div>Available</div>
      <div>Status</div>
    </div>
  )
}