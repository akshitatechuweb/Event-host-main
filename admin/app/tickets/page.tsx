"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TicketSearch } from "@/components/tickets/TicketSearch"
import { TicketTable } from "@/components/tickets/TicketTable"
import AddTicketModal from "@/components/tickets/AddTicketModal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function TicketsPage() {
  const [openAddTicket, setOpenAddTicket] = useState(false)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-foreground">Tickets</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor ticket sales, availability, and revenue across events
              </p>
            </div>

          </div>
        </div>

        <div>
          <TicketSearch />
        </div>

        <div>
          <TicketTable />
        </div>

        <AddTicketModal open={openAddTicket} onClose={() => setOpenAddTicket(false)} />
      </div>
    </DashboardLayout>
  )
}
