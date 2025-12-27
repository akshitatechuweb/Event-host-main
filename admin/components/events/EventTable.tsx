"use client";

import { useEffect, useState } from "react";
import { EventTableHeader } from "./EventTableHeader";
import { EventTableRow } from "./EventTableRow";
import { toast } from "sonner";

interface Event {
  _id: string;
  eventName: string;
  hostedBy: string;
  date: string;
  city: string;
  currentBookings: number;
  maxCapacity: number;
  status?: "active" | "completed" | "cancelled";
}

interface EventTableProps {
  refresh?: number;
}

export function EventTable({ refresh }: EventTableProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch events");
      }

      setEvents(data.events || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (events.length === 0) {
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
      {events.map((event) => (
        <EventTableRow key={event._id} event={event} onRefresh={fetchEvents} />
      ))}
    </div>
  );
}