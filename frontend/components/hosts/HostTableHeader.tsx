"use client"

export function HostTableHeader() {
  return (
    <div className="grid grid-cols-6 gap-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-t-xl font-semibold">
      <div>Host Name</div>
      <div>Email</div>
      <div>Events Hosted</div>
      <div>Total Revenue</div>
      <div>Status</div>
      <div>Actions</div>
    </div>
  )
}