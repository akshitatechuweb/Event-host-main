"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Ticket, Loader2 } from "lucide-react"

interface Event {
  _id: string
  eventName: string
  date: string
  city: string
  currentBookings?: number
  maxCapacity?: number
}

export default function TransactionsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch("/api/events", {
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "Failed to fetch events")
        }

        const data = await response.json()
        setEvents(data.events || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">View transactions for each event</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Events Found</h2>
            <p className="text-muted-foreground mb-6">
              There are no events available to view transactions for.
            </p>
            <Link href="/events">
              <Button variant="outline" className="gap-2">
                Go to Events
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event._id}
                href={`/transactions/${event._id}`}
                className="bg-card border border-border rounded-lg p-6 hover:border-muted-foreground/30 transition-smooth group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {event.eventName}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{event.city}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                {event.currentBookings !== undefined && (
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {event.currentBookings} {event.currentBookings === 1 ? "booking" : "bookings"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    View Transactions
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}