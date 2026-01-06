import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EventTransactionsView } from "@/components/transactions/EventTransactionsView";

export default async function EventTransactionsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <DashboardLayout>
      <EventTransactionsView eventId={eventId} />
    </DashboardLayout>
  );
}
