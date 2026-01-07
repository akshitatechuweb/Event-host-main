"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DollarSign, Users, Calendar, TrendingUp, Loader2 } from "lucide-react"
import { StatsCard } from "./StatsCard"
import { clientFetch } from "@/lib/client"

/* =========================
   Types
========================= */

interface DashboardStats {
  totalRevenue: number
  totalEvents: number
  totalUsers: number
  totalTransactions: number
}

interface DashboardStatsResponse {
  success?: boolean
  stats?: {
    totalRevenue?: number | string | null
    totalEvents?: number | string | null
    totalUsers?: number | string | null
    totalTransactions?: number | string | null
  }
  __unauthorized?: boolean
}

/* =========================
   Component
========================= */

export function StatsOverview() {
  const router = useRouter()

  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalEvents: 0,
    totalUsers: 0,
    totalTransactions: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      try {
        const response = await clientFetch("/dashboard/stats");
        const data = await response.json();

        if (response.ok && data.success && data.stats && !cancelled) {
          setStats({
            totalRevenue: Number(data.stats.totalRevenue) || 0,
            totalEvents: Number(data.stats.totalEvents) || 0,
            totalUsers: Number(data.stats.totalUsers) || 0,
            totalTransactions: Number(data.stats.totalTransactions) || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats()

    return () => {
      cancelled = true
    }
  }, [router])

  // ⛔ Prevent UI flash if redirecting
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
        value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
        change={`${stats.totalTransactions.toLocaleString("en-IN")} transactions`}
        isPositive
        icon={DollarSign}
      />
      <StatsCard
        title="Total Users"
        value={stats.totalUsers.toLocaleString("en-IN")}
        change="Registered users"
        isPositive
        icon={Users}
      />
      <StatsCard
        title="Total Events"
        value={stats.totalEvents.toLocaleString("en-IN")}
        change="Active events"
        isPositive
        icon={Calendar}
      />
      <StatsCard
        title="Total Transactions"
        value={stats.totalTransactions.toLocaleString("en-IN")}
        change="Confirmed bookings"
        isPositive
        icon={TrendingUp}
      />
    </div>
  )
}
