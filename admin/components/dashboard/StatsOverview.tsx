"use client"

import { StatsCard } from "./StatsCard"
import { DollarSign, Users, Calendar, TrendingUp } from "lucide-react"

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Revenue"
        value="$45,231"
        change="+20.1% from last month"
        isPositive={true}
        icon={DollarSign}
      />
      <StatsCard title="Active Users" value="2,350" change="+15.3% from last month" isPositive={true} icon={Users} />
      <StatsCard title="Total Events" value="124" change="+8.2% from last month" isPositive={true} icon={Calendar} />
      <StatsCard
        title="Growth Rate"
        value="23.5%"
        change="-2.4% from last month"
        isPositive={false}
        icon={TrendingUp}
      />
    </div>
  )
}
