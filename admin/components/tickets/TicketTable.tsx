"use client"

import { useEffect, useState } from "react"
import { TicketTableHeader } from "./TicketTableHeader"
import { TicketTableRow } from "./TicketTableRow"
import { getAllTickets } from "@/lib/admin"
import { Loader2 } from "lucide-react"

interface Ticket {
  _id: string
  eventId: string
  eventName: string
  ticketType: string
  price: string
  total: number
  sold: number
  available: number
}

export function TicketTable() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true)
        setError(null)
        const response = await getAllTickets()
        
        if (response.success) {
          // Use tickets directly - price is already formatted in API
          const formattedTickets: Ticket[] = (response.tickets || []).map((ticket: any) => ({
            _id: ticket._id,
            eventId: ticket.eventId,
            eventName: ticket.eventName,
            ticketType: ticket.ticketType,
            price: ticket.price, // Already formatted from API
            total: ticket.total,
            sold: ticket.sold,
            available: ticket.available,
          }))
          
          setTickets(formattedTickets)
        } else {
          throw new Error(response.message || "Failed to fetch tickets")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load tickets"
        setError(errorMessage)
        console.error("Error fetching tickets:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  useEffect(() => {
    if (tickets.length > 0) {
      setTickets(prev => prev.map(t => ({
        ...t,
        price: typeof t.price === 'number' ? `₹${t.price.toLocaleString('en-IN')}` : t.price
      })))
    }
  }, [tickets.length])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-12">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
          <p className="text-muted-foreground">Loading tickets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No tickets found.</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <TicketTableHeader />
      <div>
        {tickets.map((ticket) => (
          <TicketTableRow key={ticket._id} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
