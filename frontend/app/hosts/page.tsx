import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { HostSearch } from "@/components/hosts/HostSearch"
import { HostTable } from "@/components/hosts/HostTable"

export const metadata = {
  title: "Hosts - Event Host",
  description: "Manage event hosts",
}

export default function HostsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Host Management</h1>
          <p className="text-gray-600 mt-1">Manage host applications and approvals</p>
        </div>

        <HostSearch />

        <HostTable />
      </div>
    </DashboardLayout>
  )
}