"use client";

import { useEffect, useMemo, useState } from "react";
import { EventTableHeader } from "./EventTableHeader";
import { EventTableRow } from "./EventTableRow";
import { toast } from "sonner";
import { filterBySearchQuery } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

// Import the shared Event type (create this file next!)
import { Event } from "@/types/event";

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
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      
      if (!API_BASE_URL) {
        throw new Error("API base URL not configured");
      }

      const response = await fetch(`${API_BASE_URL}/api/event/events`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch events");
      }

      const data = await response.json();

      // Handle different response formats
      const events = Array.isArray(data) ? data : (data.events || data.data || []);

      setEvents(events);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch events";
      toast.error(message);
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
    [events, debouncedQuery]
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