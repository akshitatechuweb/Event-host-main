import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { UserSearch } from "@/components/users/UserSearch"
import { UserTable } from "@/components/users/UserTable"

export const metadata = {
  title: "Users - Event Host",
  description: "Manage all users",
}

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all registered users</p>
        </div>

        <UserSearch />

        <UserTable />
      </div>
    </DashboardLayout>
  )
}