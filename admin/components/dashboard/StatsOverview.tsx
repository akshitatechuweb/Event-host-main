"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "./StatsCard"
import { DollarSign, Users, Calendar, TrendingUp } from "lucide-react"
import { getDashboardStats } from "@/lib/admin"
import { Loader2 } from "lucide-react"

export function StatsOverview() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalEvents: 0,
    totalUsers: 0,
    totalTransactions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await getDashboardStats()
        if (response.success && response.stats) {
          // Ensure all values are numbers with fallback to 0
          setStats({
            totalRevenue: Number(response.stats.totalRevenue) || 0,
            totalEvents: Number(response.stats.totalEvents) || 0,
            totalUsers: Number(response.stats.totalUsers) || 0,
            totalTransactions: Number(response.stats.totalTransactions) || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card/70 backdrop-blur-xl p-6"
          >
            <div className="flex items-center justify-center h-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Revenue"
        value={`₹${(stats.totalRevenue || 0).toLocaleString("en-IN")}`}
        change={`${stats.totalTransactions || 0} transactions`}
        isPositive={true}
        icon={DollarSign}
      />
      <StatsCard
        title="Total Users"
        value={(stats.totalUsers || 0).toLocaleString("en-IN")}
        change="Registered users"
        isPositive={true}
        icon={Users}
      />
      <StatsCard
        title="Total Events"
        value={(stats.totalEvents || 0).toLocaleString("en-IN")}
        change="Active events"
        isPositive={true}
        icon={Calendar}
      />
      <StatsCard
        title="Total Transactions"
        value={(stats.totalTransactions || 0).toLocaleString("en-IN")}
        change="Confirmed bookings"
        isPositive={true}
        icon={TrendingUp}
      />
    </div>
  )
}