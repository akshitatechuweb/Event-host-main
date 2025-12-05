"use client"

import { Ticket } from "lucide-react"

interface TicketTableRowProps {
  eventName: string
  ticketType: string
  price: string
  total: number
  sold: number
  available: number
}

export function TicketTableRow({ 
  eventName, 
  ticketType, 
  price, 
  total, 
  sold, 
  available 
}: TicketTableRowProps) {
  const soldPercentage = (sold / total) * 100
  const isSoldOut = available === 0
  const isLowStock = available > 0 && available <= total * 0.2

  return (
    <div className="grid grid-cols-7 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-indigo-50/50 transition-colors items-center">
      <div className="font-medium text-gray-900">{eventName}</div>
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-indigo-600" />
        <span className="text-gray-700">{ticketType}</span>
      </div>
      <div className="text-gray-900 font-semibold">{price}</div>
      <div className="text-gray-600">{total}</div>
      <div className="text-gray-900 font-medium">{sold}</div>
      <div className={`font-semibold ${
        isSoldOut ? "text-red-600" : isLowStock ? "text-yellow-600" : "text-green-600"
      }`}>
        {available}
      </div>
      <div>
        {isSoldOut ? (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Low Stock
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Available
          </span>
        )}
      </div>
    </div>
  )
}