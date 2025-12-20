import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { StatsOverview } from "@/components/dashboard/StatsOverview"
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"

export const metadata = {
  title: "Dashboard - Event Host",
  description: "Event management dashboard",
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto space-y-16 py-14 px-6">

        {/* Header */}
        <header className="relative space-y-4">
          {/* Cotton candy ambient clouds */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-300/20 blur-[160px] rounded-full -z-10" />
          <div className="absolute -top-24 right-1/4 w-96 h-96 bg-blue-300/20 blur-[160px] rounded-full -z-10" />
          <div className="absolute top-10 right-0 w-72 h-72 bg-purple-300/20 blur-[140px] rounded-full -z-10" />

          <h1 className="text-[3rem] sm:text-[3.5rem] font-semibold tracking-tight leading-tight bg-gradient-to-r from-pink-500 via-violet-500 to-blue-500 bg-clip-text text-transparent">
            Dashboard
          </h1>

          <p className="flex items-center gap-4 text-base sm:text-lg text-muted-foreground">
            <span className="h-px w-10 bg-gradient-to-r from-pink-300 via-violet-300 to-blue-300" />
            Overview of your event management system
          </p>
        </header>

        {/* Stats */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <StatsOverview />
        </section>

        {/* Main Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Events */}
          <div className="lg:col-span-7 group relative">
            <div className="absolute inset-0 rounded-[1.9rem] bg-gradient-to-br from-pink-200/30 via-transparent to-blue-200/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative premium-card rounded-[1.9rem] p-1 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_30px_70px_rgba(236,72,153,0.18)]">
              <div className="rounded-[1.75rem] bg-white/75 dark:bg-black/30 p-6">
                <RecentEventsTable />
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="lg:col-span-5 group relative">
            <div className="absolute inset-0 rounded-[1.9rem] bg-gradient-to-br from-blue-200/30 via-transparent to-purple-200/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative premium-card rounded-[1.9rem] p-1 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_30px_70px_rgba(99,102,241,0.18)]">
              <div className="rounded-[1.75rem] bg-white/75 dark:bg-black/30 p-6">
                <RecentTransactions />
              </div>
            </div>
          </div>

        </section>
      </div>
    </DashboardLayout>
  )
}
