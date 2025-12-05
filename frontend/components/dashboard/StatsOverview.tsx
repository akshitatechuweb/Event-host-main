import { StatCard } from "./StatsCard"
import { Users, Calendar, TrendingUp, Ticket } from "lucide-react"

export function StatsOverview() {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value="1,234"
        change="13.2%"
        changeType="positive"
        icon={<Users className="h-6 w-6 text-white" />}
        iconBgColor="bg-linear-to-br from-blue-500 to-indigo-600"
      />

      <StatCard
        title="Active Events"
        value="56"
        change="8.2%"
        changeType="positive"
        icon={<Calendar className="h-6 w-6 text-white" />}
        iconBgColor="bg-linear-to-br from-purple-500 to-indigo-500"
      />

      <StatCard
        title="Total Revenue"
        value="₹2.4L"
        change="15.1%"
        changeType="positive"
        icon={<TrendingUp className="h-6 w-6 text-white" />}
        iconBgColor="bg-linear-to-br from-green-500 to-emerald-600"
      />

      <StatCard
        title="Tickets Sold"
        value="892"
        change="23.5%"
        changeType="positive"
        icon={<Ticket className="h-6 w-6 text-white" />}
        iconBgColor="bg-linear-to-br from-pink-500 to-rose-600"
      />
    </div>
  )
}
