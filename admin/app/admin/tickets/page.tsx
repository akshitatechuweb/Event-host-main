"use client";

import { Suspense, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TicketSearch } from "@/components/tickets/TicketSearch";
import { TicketTable } from "@/components/tickets/TicketTable";
import AddTicketModal from "@/components/tickets/AddTicketModal";
import { Loader2 } from "lucide-react";

function TicketsContent() {
  const [openAddTicket, setOpenAddTicket] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-[1500px] mx-auto px-8 py-14 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-sidebar-primary to-pink-500 bg-clip-text text-transparent inline-block">
            Tickets
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Monitor ticket sales, availability, and revenue across events
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <TicketSearch value={searchQuery} onChange={setSearchQuery} />
        <TicketTable searchQuery={searchQuery} />
      </div>

      <AddTicketModal
        open={openAddTicket}
        onClose={() => setOpenAddTicket(false)}
      />
    </div>
  );
}

export default function TicketsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary" />
        </div>
      }>
        <TicketsContent />
      </Suspense>
    </DashboardLayout>
  );
}
