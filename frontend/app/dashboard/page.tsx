import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"

export const metadata = {
  title: "Dashboard - Event Host",
  description: "Manage your events and transactions",
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Heres your event management summary.</p>
        </div>

        <StatsOverview />

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentEventsTable />
          </div>
          <div>
            <RecentTransactions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
