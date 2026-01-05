// app/transactions/[eventId]/page.tsx
import type { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EventTransactionsView } from "@/components/transactions/EventTransactionsView";

export const metadata: Metadata = {
  title: "Event Transactions",
  description: "View and analyze transactions for a specific event",
};

export default async function EventTransactionsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  // Safety check (though Next.js should never pass empty eventId)
  if (!eventId) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-destructive">Invalid event ID</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Page Header */}
        <header className="space-y-1.5 max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Review bookings, payments, and transaction activity for this event
          </p>
        </header>

        {/* Main Content */}
        <EventTransactionsView eventId={eventId} />
      </div>
    </DashboardLayout>
  );
}