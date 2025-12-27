"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EventSearch } from "@/components/events/EventSearch";
import { EventTable } from "@/components/events/EventTable";
import AddEventModal from "@/components/events/AddEventModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EventsPage() {
  const [openAddEvent, setOpenAddEvent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEventCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <DashboardLayout>
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Events
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all events
          </p>
        </div>

        <Button
          onClick={() => setOpenAddEvent(true)}
          className="h-10 px-5 rounded-lg bg-background border border-border text-foreground shadow-sm hover:bg-muted dark:bg-primary dark:text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </header>

      <section className="rounded-xl border border-border bg-card overflow-hidden">
        <EventSearch />
        <EventTable refresh={refreshKey} />
      </section>

      <AddEventModal
        open={openAddEvent}
        onClose={() => setOpenAddEvent(false)}
        onEventCreated={handleEventCreated}
      />
    </DashboardLayout>
  );
}