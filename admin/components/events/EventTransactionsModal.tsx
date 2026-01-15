"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getEventTransactions } from "@/lib/admin";
import { toast } from "sonner";
import { X } from "lucide-react";

interface BookingSummary {
  _id: string;
  orderId?: string;
  totalAmount?: number;
  ticketCount?: number;
  items?: Array<{ passType: string; price: number; quantity: number }>;
  buyer?: { _id?: string; name?: string; email?: string } | null;
}

interface TransactionItem {
  _id: string;
  amount: number;
  platformFee?: number;
  payoutToHost?: number;
  providerTxnId?: string;
  status?: string;
  createdAt?: string;
  booking?: BookingSummary | null;
}

export default function EventTransactionsModal({
  open,
  onClose,
  eventId,
  eventName,
}: {
  open: boolean;
  onClose: () => void;
  eventId: string | null;
  eventName?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    totalTickets: 0,
  });

  useEffect(() => {
    if (!open || !eventId) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getEventTransactions(eventId);
        if (!mounted) return;
        if (!res.success)
          throw new Error(res.message || "Failed to fetch transactions");

        setTransactions(res.transactions || []);
        setTotals(res.totals || totals);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, eventId]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-6xl max-h-[90vh] p-0 gap-0 rounded-3xl border-0 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col">
        {/* Header */}
        <DialogHeader className="px-8 py-6 border-b border-border/50 bg-background/80 backdrop-blur-sm rounded-t-3xl shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              Transactions for {eventName || "Event"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Revenue"
              value={`₹${totals.totalRevenue.toLocaleString()}`}
            />
            <StatCard
              label="Total Transactions"
              value={totals.totalTransactions}
            />
            <StatCard label="Tickets Sold" value={totals.totalTickets} />
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    {[
                      "Date",
                      "Buyer",
                      "Order ID",
                      "Items",
                      "Amount",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                          h === "Amount"
                            ? "text-right"
                            : h === "Status"
                            ? "text-center"
                            : "text-left"
                        } text-muted-foreground`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span className="text-sm text-muted-foreground">
                            Loading transactions...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-muted-foreground"
                      >
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr
                        key={t._id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">
                            {new Date(t.createdAt || "").toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(t.createdAt || "").toLocaleTimeString()}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium truncate max-w-[180px]">
                            {t.booking?.buyer?.name || "Guest"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {t.booking?.buyer?.email || "—"}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-mono text-sm text-muted-foreground truncate max-w-[160px]">
                          {t.booking?.orderId || "—"}
                        </td>

                        <td className="px-6 py-4">
                          {(t.booking?.items || []).map((it, i) => (
                            <div key={i} className="text-sm">
                              {it.passType} × {it.quantity}
                            </div>
                          ))}
                        </td>

                        <td className="px-6 py-4 text-right font-semibold">
                          ₹{t.amount.toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="rounded-full px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-600">
                            {t.status || "pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer (NOT sticky anymore) */}
        <div className="px-8 py-4 border-t border-border/50 bg-background/80 backdrop-blur-sm rounded-b-3xl flex justify-end">
          <Button variant="ghost" onClick={onClose} className="rounded-xl px-6">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Small helper */
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-linear-to-br from-background/50 to-muted/30 border border-border/50 p-6 shadow-sm">
      <div className="text-sm text-muted-foreground mb-2">{label}</div>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
