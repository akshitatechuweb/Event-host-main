"use client";

import { useEffect, useState } from "react";
import { TransactionStats } from "./TransactionStats";
import { TransactionList } from "./TransactionList";
import { TransactionSearch } from "./TransactionSearch";
import { getEventTransactions } from "@/lib/admin";
import { EventTransactionsResponse } from "@/types/transaction";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Pagination } from "../ui/Pagination";

interface EventTransactionsViewProps {
  eventId: string;
}

export function EventTransactionsView({ eventId }: EventTransactionsViewProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EventTransactionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  useEffect(() => {
    if (!eventId) {
      setError("Event ID is required");
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchTransactions() {
      try {
        setLoading(true);
        setError(null);

        const response = await getEventTransactions(eventId, page, limit);

        console.log("RAW EVENT TRANSACTIONS RESPONSE:", response);

        if (!mounted) return;

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch transactions");
        }

        setData(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load transactions";
        setError(message);
        toast.error(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchTransactions();

    return () => {
      mounted = false;
    };
  }, [eventId, page, limit]);

  console.log("EVENT TRANSACTIONS VIEW MOUNTED:", eventId);
  /* -------------------- Loading -------------------- */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28">
        <div className="space-y-3 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading transactions…</p>
        </div>
      </div>
    );
  }

  /* -------------------- Error -------------------- */
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-28">
        <div className="max-w-sm rounded-xl border border-destructive/10 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive mb-1">
            Unable to load transactions
          </p>
          <p className="text-xs text-destructive/70">
            {error || "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }

  /* -------------------- Content -------------------- */
  return (
    <div className="space-y-12">
      {/* Stats */}
      <TransactionStats totals={data.totals} />

      {/* Controls + List */}
      <div className="space-y-6">
        <TransactionSearch />
        <div className="bg-card border border-sidebar-border rounded-3xl shadow-xl overflow-hidden glass-morphism">
          <TransactionList transactions={data.transactions} />
          {data.meta && (
            <div className="border-t border-sidebar-border/50 bg-muted/30">
              <Pagination
                currentPage={data.meta.currentPage}
                totalPages={data.meta.totalPages}
                totalItems={data.meta.totalItems}
                limit={data.meta.limit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
