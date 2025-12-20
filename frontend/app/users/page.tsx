import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { UserSearch } from "@/components/users/UserSearch"
import { UserTableHeader } from "@/components/users/UserTable"

export const metadata = {
  title: "Users - Event Host",
  description: "Manage all users",
}

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor registered users</p>
        </div>

        <UserSearch />
        <UserTableHeader />
      </div>
    </DashboardLayout>
  )
}
