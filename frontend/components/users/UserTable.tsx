"use client"

import { UserTableHeader } from "./UserTableHeader"
import { UserTableRow } from "./UserTableRow"

const dummyUsers = [
  { id: 1, name: "Rahul Kumar", phone: "+91 98765 43210", city: "Mumbai", role: "Attendee", verified: true },
  { id: 2, name: "Priya Singh", phone: "+91 87654 32109", city: "Delhi", role: "Host", verified: true },
  { id: 3, name: "Amit Patel", phone: "+91 76543 21098", city: "Bangalore", role: "Attendee", verified: false },
  { id: 4, name: "Sneha Sharma", phone: "+91 65432 10987", city: "Pune", role: "Organizer", verified: true },
  { id: 5, name: "Vikram Rao", phone: "+91 54321 09876", city: "Hyderabad", role: "Attendee", verified: true },
]

export function UserTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <UserTableHeader />
      <div>
        {dummyUsers.map((user) => (
          <UserTableRow
            key={user.id}
            name={user.name}
            phone={user.phone}
            city={user.city}
            role={user.role}
            verified={user.verified}
          />
        ))}
      </div>
      
      {/* Pagination */}
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