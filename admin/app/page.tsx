import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"

export const metadata = {
  title: "Dashboard - Event Host",
  description: "Event management dashboard",
}

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your event management system</p>
        </div>

        <StatsOverview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentEventsTable />
          <RecentTransactions />
        </div>
      </div>
    </DashboardLayout>
  )
}
