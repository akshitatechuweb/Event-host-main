import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { EventTransactionsView } from "@/components/transactions/EventTransactionsView"

export const metadata = {
  title: "Event Transactions - Event Host",
  description: "View event-specific transactions",
}

export default async function EventTransactionsPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = await params

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Transactions</h1>
          <p className="text-gray-600 mt-1">Monitor payment transactions for this event</p>
        </div>

        <EventTransactionsView eventId={eventId} />
      </div>
    </DashboardLayout>
  )
}
