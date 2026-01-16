"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEventTransactions } from "@/lib/admin";
import { Transaction } from "@/types/transaction";
import {
  Loader2,
  Receipt,
  Calendar,
  User,
  IndianRupee,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/Pagination";

interface PassTransactionsModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  ticketType: string;
}

export function PassTransactionsModal({
  open,
  onClose,
  eventId,
  eventName,
  ticketType,
}: PassTransactionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    if (open && eventId) {
      fetchTransactions(1);
    } else if (!open) {
      setTransactions([]);
      setError(null);
      setPage(1);
    }
  }, [open, eventId, ticketType]);

  const fetchTransactions = async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEventTransactions(
        eventId,
        pageNum,
        10,
        ticketType
      );
      if (response.success) {
        setTransactions(response.transactions);
        setMeta(response.meta);
        setPage(pageNum);
      } else {
        setError(response.message || "Failed to fetch transactions");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching transactions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "failed":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 bg-card/95 backdrop-blur-xl border-border/40 shadow-2xl rounded-3xl">
        <DialogHeader className="p-6 pb-4 border-b border-border/30">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {ticketType ? `${ticketType} Transactions` : "All Transactions"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Financial trail for {eventName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Fetching records...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-2xl border border-destructive/20 bg-destructive/5 text-center">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                <Receipt className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  No transactions found
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  No successful bookings have been recorded for this pass type
                  yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="group relative p-5 rounded-2xl border border-border/40 bg-muted/5 hover:bg-muted/10 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground/60 uppercase tracking-tighter">
                          ID: {tx._id.slice(-8)}
                        </span>
                        <Badge
                          variant="outline"
                          className={getStatusColor(tx.status)}
                        >
                          {tx.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                          <User className="w-4 h-4 text-muted-foreground/70" />
                          {tx.booking?.buyer?.name || "Guest"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-muted-foreground/50" />
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Receipt className="w-4 h-4 text-muted-foreground/50" />
                          {tx.providerTxnId || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 text-xl font-bold text-foreground">
                        <IndianRupee className="w-4 h-4" />
                        {tx.amount.toLocaleString("en-IN")}
                      </div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40">
                        Total Paid
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-border/30 bg-muted/5">
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              totalItems={meta.totalItems}
              limit={meta.limit}
              onPageChange={fetchTransactions}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
