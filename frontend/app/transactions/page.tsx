import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { TransactionStats } from "@/components/transactions/TransactionStats"
import { TransactionSearch } from "@/components/transactions/TransactionSearch"
import { TransactionList } from "@/components/transactions/TransactionList"

export const metadata = {
  title: "Transactions - Event Host",
  description: "View all transactions",
}

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Monitor all payment transactions</p>
        </div>

        <TransactionStats />

        <TransactionSearch />

        <TransactionList />
      </div>
    </DashboardLayout>
  )
}