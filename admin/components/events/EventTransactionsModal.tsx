"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getEventTransactions } from "@/lib/admin";
import { toast } from "sonner";

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

export default function EventTransactionsModal({ open, onClose, eventId, eventName }: { open: boolean; onClose: () => void; eventId: string | null; eventName?: string }) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totals, setTotals] = useState<{ totalRevenue: number; totalTransactions: number; totalTickets: number }>({ totalRevenue: 0, totalTransactions: 0, totalTickets: 0 });

  useEffect(() => {
    if (!open || !eventId) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getEventTransactions(eventId);
        if (!mounted) return;
        if (!res.success) throw new Error(res.message || "Failed to fetch transactions");
        setTransactions(res.transactions || []);
        setTotals(res.totals || { totalRevenue: 0, totalTransactions: 0, totalTickets: 0 });
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [open, eventId]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[92vw] max-w-[900px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Transactions for {eventName || "Event"}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
              <div className="text-2xl font-semibold">₹{totals.totalRevenue}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Transactions</div>
              <div className="text-lg font-medium">{totals.totalTransactions}</div>
              <div className="text-sm text-muted-foreground">Tickets sold: {totals.totalTickets}</div>
            </div>
          </div>

          <div className="overflow-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-6 text-center">Loading...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={6} className="p-6 text-center">No transactions found</td></tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t._id} className="border-t">
                      <td className="p-3">{new Date(t.createdAt || "").toLocaleString()}</td>
                      <td className="p-3">{t.booking?.buyer?.name || "Guest"}<div className="text-xs text-muted-foreground">{t.booking?.buyer?.email || ""}</div></td>
                      <td className="p-3">{t.booking?.orderId}</td>
                      <td className="p-3">{(t.booking?.items || []).map((it) => `${it.passType} × ${it.quantity}`).join(", ")}</td>
                      <td className="p-3">₹{t.amount}</td>
                      <td className="p-3">{t.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
