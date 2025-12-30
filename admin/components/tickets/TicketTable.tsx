"use client"

import { useEffect, useState } from "react"
import { getAllTickets } from "@/lib/admin"
import { Loader2 } from "lucide-react"
import { EventTicketCard } from "./EventTicketCard"

interface Ticket {
  _id: string
  eventId: string
  eventName: string
  ticketType: string
  price: number
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
        const res = await getAllTickets()
        if (!res.success) throw new Error("Failed to load tickets")
        setTickets(res.tickets)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-lg border border-border/50 bg-muted/20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Loading tickets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg border border-destructive/30 bg-destructive/5">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  const grouped = tickets.reduce<Record<string, Ticket[]>>((acc, t) => {
    acc[t.eventName] = acc[t.eventName] || []
    acc[t.eventName].push(t)
    return acc
  }, {})

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-lg border border-border/50 bg-muted/20">
        <p className="text-sm text-muted-foreground">No tickets found. Create one to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([eventName, passes]) => (
        <EventTicketCard key={eventName} eventName={eventName} passes={passes} />
      ))}
    </div>
  )
}
