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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Events</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all events
            </p>
          </div>

          <Button onClick={() => setOpenAddEvent(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>

        <EventSearch />
        <EventTable />

        <AddEventModal
          open={openAddEvent}
          onClose={() => setOpenAddEvent(false)}
        />
      </div>
    </DashboardLayout>
  );
}
