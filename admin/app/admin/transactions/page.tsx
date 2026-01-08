"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ArrowRight, Calendar, Ticket, Loader2 } from "lucide-react";

interface Event {
  _id: string;
  eventName: string;
  date: string;
  city: string;
  currentBookings?: number;
  maxCapacity?: number;
}

interface EventsApiResponse {
  events: Event[];
}

export default function TransactionsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        // ✅ SAME-ORIGIN FETCH (NO ENV, NO BACKEND URL)
        const response = await fetch("/api/admin/events", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            (errorData as { message?: string }).message ||
              "Failed to fetch events"
          );
        }

        const data = (await response.json()) as EventsApiResponse | Event[];

        // Handle different response formats (unchanged)
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents((data as EventsApiResponse).events ?? []);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Review bookings and payment activity for your events
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Loading events…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-6">
            <p className="text-sm font-medium text-destructive mb-1">
              Unable to load events
            </p>
            <p className="text-xs text-destructive/70">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
            <Calendar className="w-10 h-10 text-muted-foreground/60 mb-4" />
            <h2 className="text-base font-medium text-foreground mb-1">
              No events yet
            </h2>
            <p className="text-sm text-muted-foreground">
              Create an event to start tracking transactions.
            </p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event._id}
                href={`/admin/transactions/${event._id}`}
                className="group relative rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-black/8"
              >
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-medium text-foreground truncate">
                        {event.eventName}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.city}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                  </div>

                  {event.currentBookings !== undefined && (
                    <div className="flex items-center gap-2 pt-3 border-t border-border/30 text-sm text-muted-foreground">
                      <Ticket className="w-4 h-4" />
                      <span>
                        {event.currentBookings}{" "}
                        {event.currentBookings === 1 ? "booking" : "bookings"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors pt-1">
                    <span>View transactions</span>
                    <ArrowRight className="ml-1.5 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
