"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TicketSearch } from "@/components/tickets/TicketSearch";
import { TicketTable } from "@/components/tickets/TicketTable";
import AddTicketModal from "@/components/tickets/AddTicketModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TicketsPage() {
  const [openAddTicket, setOpenAddTicket] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Tickets</h1>
            <p className="text-muted-foreground mt-1">
              Track ticket sales and availability
            </p>
          </div>

          <Button onClick={() => setOpenAddTicket(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Ticket
          </Button>
        </div>

        <TicketSearch />
        <TicketTable />

        <AddTicketModal
          open={openAddTicket}
          onClose={() => setOpenAddTicket(false)}
        />
      </div>
    </DashboardLayout>
  );
}
