"use client"

import { HostTableHeader } from "./HostTableHeader"
import { HostTableRow } from "./HostTableRow"

const dummyHosts = [
  { id: 1, name: "John Doe", email: "john@example.com", eventsHosted: 12, revenue: "₹1.2L", status: "approved" as const },
  { id: 2, name: "Jane Smith", email: "jane@example.com", eventsHosted: 8, revenue: "₹85K", status: "approved" as const },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", eventsHosted: 0, revenue: "₹0", status: "pending" as const },
  { id: 4, name: "Sarah Williams", email: "sarah@example.com", eventsHosted: 15, revenue: "₹2.1L", status: "approved" as const },
  { id: 5, name: "David Brown", email: "david@example.com", eventsHosted: 0, revenue: "₹0", status: "rejected" as const },
]

export function HostTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <HostTableHeader />
      <div>
        {dummyHosts.map((host) => (
          <HostTableRow
            key={host.id}
            name={host.name}
            email={host.email}
            eventsHosted={host.eventsHosted}
            revenue={host.revenue}
            status={host.status}
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