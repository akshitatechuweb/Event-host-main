"use client";

import { Suspense, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EventSearch } from "@/components/events/EventSearch";
import { EventTable } from "@/components/events/EventTable";
import AddEventModal from "@/components/events/AddEventModal";
import EventTransactionsModal from "@/components/events/EventTransactionsModal";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Import the single shared type
import { Event } from "@/types/event";

function EventsContent() {
  const [openAddEvent, setOpenAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [transactionsEventId, setTransactionsEventId] = useState<string | null>(null);
  const [transactionsEventName, setTransactionsEventName] = useState<string | undefined>();

  const [searchQuery, setSearchQuery] = useState("");

  const handleEventAction = () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setOpenAddEvent(true);
  };

  const handleViewTransactions = (eventId: string, eventName?: string) => {
    setTransactionsEventId(eventId);
    setTransactionsEventName(eventName);
    setTransactionsOpen(true);
  };

  return (
    <div className="max-w-[1500px] mx-auto px-8 py-10 space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sidebar-primary to-pink-500 bg-clip-text text-transparent inline-block">
            Events
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage and monitor all community events
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingEvent(null);
            setOpenAddEvent(true);
          }}
          className="h-12 px-6 rounded-2xl bg-sidebar-primary text-white shadow-lg shadow-sidebar-primary/25 hover:bg-sidebar-primary/90 transition-smooth"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Event
        </Button>
      </header>

      <section className="rounded-3xl border border-border bg-card shadow-xl overflow-hidden glass-morphism">
        <EventSearch value={searchQuery} onChange={setSearchQuery} />

        <EventTable
          onEdit={handleEdit}
          onViewTransactions={handleViewTransactions}
          searchQuery={searchQuery}
        />

        <EventTransactionsModal
          open={transactionsOpen}
          onClose={() => setTransactionsOpen(false)}
          eventId={transactionsEventId}
          eventName={transactionsEventName}
        />
      </section>

      <AddEventModal
        open={openAddEvent}
        onClose={() => {
          setOpenAddEvent(false);
          setEditingEvent(null);
        }}
        onEventCreated={handleEventAction}
        onEventUpdated={handleEventAction}
        editingEvent={editingEvent}
      />
    </div>
  );
}

export default function EventsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary" />
        </div>
      }>
        <EventsContent />
      </Suspense>
    </DashboardLayout>
  );
}