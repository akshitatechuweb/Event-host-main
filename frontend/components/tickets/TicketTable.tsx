"use client"

import { TicketTableHeader } from "./TicketTableHeader"
import { TicketTableRow } from "./TicketTableRow"

const dummyTickets = [
  { 
    id: 1, 
    eventName: "Tech Conference 2024", 
    ticketType: "VIP", 
    price: "₹2,500", 
    total: 50, 
    sold: 45, 
    available: 5 
  },
  { 
    id: 2, 
    eventName: "Tech Conference 2024", 
    ticketType: "General", 
    price: "₹500", 
    total: 150, 
    sold: 105, 
    available: 45 
  },
  { 
    id: 3, 
    eventName: "Music Festival", 
    ticketType: "Early Bird", 
    price: "₹1,200", 
    total: 100, 
    sold: 100, 
    available: 0 
  },
  { 
    id: 4, 
    eventName: "Music Festival", 
    ticketType: "Regular", 
    price: "₹1,800", 
    total: 400, 
    sold: 200, 
    available: 200 
  },
  { 
    id: 5, 
    eventName: "Food Carnival", 
    ticketType: "Single Entry", 
    price: "₹300", 
    total: 1000, 
    sold: 892, 
    available: 108 
  },
  { 
    id: 6, 
    eventName: "Art Exhibition", 
    ticketType: "Weekend Pass", 
    price: "₹800", 
    total: 500, 
    sold: 452, 
    available: 48 
  },
]

export function TicketTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <TicketTableHeader />
      <div>
        {dummyTickets.map((ticket) => (
          <TicketTableRow
            key={ticket.id}
            eventName={ticket.eventName}
            ticketType={ticket.ticketType}
            price={ticket.price}
            total={ticket.total}
            sold={ticket.sold}
            available={ticket.available}
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