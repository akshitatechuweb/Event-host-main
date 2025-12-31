"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EventSearch } from "@/components/events/EventSearch";
import { EventTable } from "@/components/events/EventTable";
import AddEventModal from "@/components/events/AddEventModal";
import EventTransactionsModal from "@/components/events/EventTransactionsModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export type EventType = {
  _id: string;
  eventName: string;
  hostedBy: string;
  date: string;
  city: string;
  currentBookings: number;
  maxCapacity: number;
  status?: "active" | "completed" | "cancelled";
  hostId?: string;
  passes?: Record<string, unknown>[];
};

export default function EventsPage() {
  const [openAddEvent, setOpenAddEvent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [transactionsEventId, setTransactionsEventId] = useState<string | null>(null);
  const [transactionsEventName, setTransactionsEventName] = useState<string | undefined>(undefined);

  const handleEventCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (event: EventType) => {
    setEditingEvent(event);
    setOpenAddEvent(true);
  };

  const handleViewTransactions = (eventId: string, eventName?: string) => {
    setTransactionsEventId(eventId);
    setTransactionsEventName(eventName);
    setTransactionsOpen(true);
  };

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            <span className="bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Events
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all events
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingEvent(null);
            setOpenAddEvent(true);
          }}
          className="h-10 px-5 rounded-lg bg-background border border-border text-foreground shadow-sm hover:bg-muted dark:bg-primary dark:text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </header>

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <EventSearch />
        <EventTable refresh={refreshKey} onEdit={handleEdit} onViewTransactions={handleViewTransactions} />
      <EventTransactionsModal
        open={transactionsOpen}
        onClose={() => setTransactionsOpen(false)}
        eventId={transactionsEventId}
        eventName={transactionsEventName}
      />
      </section>

      <AddEventModal
        open={openAddEvent}
        onClose={() => { setOpenAddEvent(false); setEditingEvent(null); }}
        onEventCreated={handleEventCreated}
        onEventUpdated={handleEventCreated}
        editingEvent={editingEvent}
      />
    </DashboardLayout>
  );
}