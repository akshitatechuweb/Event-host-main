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
      <div className="relative max-w-[1500px] mx-auto space-y-14 py-14 px-8">

        {/* ===== Header ===== */}
        <header className="relative flex items-center justify-between">
          {/* controlled glow */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-pink-300/20 blur-[120px] rounded-full -z-10" />
          <div className="absolute -top-20 right-0 w-96 h-96 bg-blue-300/20 blur-[140px] rounded-full -z-10" />

          <div>
            <h1 className="text-[3rem] font-semibold tracking-tight bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500 bg-clip-text text-transparent">
              Events
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Manage and monitor all events
            </p>
          </div>

          <Button
            onClick={() => setOpenAddEvent(true)}
            className="h-11 px-6 rounded-xl bg-[var(--accent-gradient)] shadow-lg shadow-pink-500/30 hover:opacity-95 active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </header>

        {/* ===== Search Card ===== */}
        <section className="premium-surface">
          <EventSearch />
        </section>

        {/* ===== Table Card ===== */}
        <section className="premium-surface-lg">
          <EventTable />
        </section>

        <AddEventModal
          open={openAddEvent}
          onClose={() => setOpenAddEvent(false)}
        />
      </div>
    </DashboardLayout>
  );
}
