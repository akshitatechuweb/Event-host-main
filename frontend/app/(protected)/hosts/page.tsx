"use client"

import { useEffect, useState } from "react"

import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { HostsHeader } from "@/components/hosts/HostsHeader"
import { HostSearch } from "@/components/hosts/HostSearch"
import { HostTable, type Host } from "@/components/hosts/HostTable"
import { getHosts } from "@/lib/admin"

export default function HostsPage() {
  const [hosts, setHosts] = useState<Host[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const data = await getHosts()
        setHosts(data.hosts ?? data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHosts()
  }, [])

  return (
    <DashboardLayout>
      <div className="max-w-[1500px] mx-auto px-8 py-14 space-y-12">
        <HostsHeader />

        <section className="space-y-6">
          <HostSearch />

          {loading && <p>Loading hosts...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <HostTable hosts={hosts} />
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
