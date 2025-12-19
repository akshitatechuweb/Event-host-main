import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TicketSearch } from "@/components/tickets/TicketSearch"
import { TicketTable } from "@/components/tickets/TicketTable"

export const metadata = {
  title: "Tickets - Event Host",
  description: "Manage event tickets",
}

export default function TicketsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Tickets</h1>
          <p className="text-muted-foreground mt-1">Track ticket sales and availability</p>
        </div>

        <TicketSearch />
        <TicketTable />
      </div>
    </DashboardLayout>
  )
}
