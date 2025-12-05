import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { EventSearch } from "@/components/events/EventSearch"
import { EventTable } from "@/components/events/EventTable"

export const metadata = {
  title: "Events - Event Host",
  description: "Manage all events",
}

export default function EventsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">View and manage all events</p>
        </div>

        <EventSearch />

        <EventTable />
      </div>
    </DashboardLayout>
  )
}