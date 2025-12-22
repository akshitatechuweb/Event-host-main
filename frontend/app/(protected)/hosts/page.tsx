import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { HostsHeader } from "@/components/hosts/HostsHeader"
import { HostSearch } from "@/components/hosts/HostSearch"
import { HostTable } from "@/components/hosts/HostTable"

export default function HostsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1500px] mx-auto px-8 py-14 space-y-12">
        <HostsHeader />

        <section className="space-y-6">
          <HostSearch />
          <HostTable />
        </section>
      </div>
    </DashboardLayout>
  )
}
