"use client";

import { useEffect, useMemo, useState } from "react";
import { EventTableHeader } from "./EventTableHeader";
import { EventTableRow } from "./EventTableRow";
import { toast } from "sonner";
import { filterBySearchQuery } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

interface Event {
  _id: string;
  eventName: string;
  hostedBy: string;
  date: string;
  city: string;
  currentBookings: number;
  maxCapacity: number;
  eventImage?: string | null; // ✅ IMPORTANT
  status?: "active" | "completed" | "cancelled";
  eventImage?: string | null;
}

interface EventTableProps {
  refresh?: number;
  onEdit?: (event: Event) => void;
  onViewTransactions?: (eventId: string, eventName?: string) => void;
  searchQuery?: string;
}

export function EventTable({
  refresh,
  onEdit,
  onViewTransactions,
  searchQuery = "",
}: EventTableProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const debouncedQuery = useDebouncedValue(searchQuery, 250);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch events");
      }

      setEvents(data.events || []);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [refresh]);

  const filteredEvents = useMemo(
    () =>
      filterBySearchQuery(events, debouncedQuery, (event) => [
        event.eventName,
        event.hostedBy,
        event.city,
      ]),
    [events, debouncedQuery],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">No events found</p>
        <p className="text-sm text-muted-foreground">
          Create your first event to get started
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      <EventTableHeader />
      {filteredEvents.map((event) => (
        <EventTableRow
          key={event._id}
          event={event}
          onRefresh={fetchEvents}
          onEdit={onEdit}
          onViewTransactions={onViewTransactions}
        />
      ))}
    </div>
  );
}
