import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <header className="relative space-y-3 mb-14">
        <div className="absolute -top-28 -left-28 w-96 h-96 bg-pink-300/15 blur-[160px] rounded-full -z-10" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-indigo-300/15 blur-[160px] rounded-full -z-10" />

        <h1 className="text-[3.2rem] font-semibold tracking-tight bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
          Dashboard
        </h1>

        <p className="flex items-center gap-3 text-muted-foreground">
          <span className="h-px w-8 bg-gradient-to-r from-pink-400 to-indigo-400" />
          Overview of your event management system
        </p>
      </header>

      <StatsOverview />

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-14">
        <div className="lg:col-span-7">
          <RecentEventsTable />
        </div>

        <div className="lg:col-span-5">
          <RecentTransactions />
        </div>
      </section>
    </DashboardLayout>
  )
}
