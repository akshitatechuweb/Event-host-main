"use client";

import { Eye, Edit2, Trash2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface EventType {
  _id: string;
  eventName: string;
  hostedBy: string;
  date: string;
  city: string;
  currentBookings: number;
  maxCapacity?: number; // ← optional (important)
  status?: "active" | "completed" | "cancelled";
  hostId?: string;
  passes?: Array<{
    totalQuantity?: number;
  }>;
  eventImage?: string | null;
}

interface EventTableRowProps {
  event: EventType;
  onRefresh: () => void;
  onEdit?: (event: EventType) => void;
  onViewTransactions?: (eventId: string, eventName?: string) => void;
}

export function EventTableRow({
  event,
  onRefresh,
  onEdit,
  onViewTransactions,
}: EventTableRowProps) {
  const [deleting, setDeleting] = useState(false);

  const status = {
    active: "bg-emerald-500/10 text-emerald-600",
    completed: "bg-slate-500/10 text-slate-500",
    cancelled: "bg-red-500/10 text-red-500",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ✅ FIX: safely derive capacity
  const derivedCapacity =
    event.maxCapacity && event.maxCapacity > 0
      ? event.maxCapacity
      : event.passes?.reduce(
          (sum, pass) => sum + (pass.totalQuantity || 0),
          0
        ) || null;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/events/${event._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete event");
      }

      toast.success("Event deleted successfully");
      onRefresh();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error(error.message || "Failed to delete event");
    } finally {
      setDeleting(false);
    }
  };

  const eventStatus = event.status || "active";

  return (
    <div className="grid grid-cols-7 gap-4 px-6 py-4 hover:bg-muted/30 transition">
      <div className="flex items-center gap-3 min-w-0">
        {event.eventImage && (
          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border/50">
            {/* Minimal thumbnail, no layout change to other columns */}
            <img
              src={event.eventImage}
              alt={event.eventName}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="font-medium truncate">{event.eventName}</div>
      </div>
      <div className="text-muted-foreground">{event.hostedBy}</div>
      <div className="text-muted-foreground">{formatDate(event.date)}</div>
      <div className="text-muted-foreground">{event.city}</div>

      {/* ✅ FIXED ATTENDEES COLUMN */}
      <div className="font-medium">
        {event.currentBookings}/
        {derivedCapacity !== null ? derivedCapacity : "—"}
      </div>

      <div>
        <span
          className={`px-3 py-1 rounded-full text-xs ${status[eventStatus]}`}
        >
          {eventStatus}
        </span>
      </div>

      <div className="flex justify-end gap-2">
        <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />

        <CreditCard
          className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => onViewTransactions?.(event._id, event.eventName)}
        />

        <Edit2
          className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => onEdit?.(event)}
        />

        <Trash2
          className={`w-4 h-4 cursor-pointer ${
            deleting
              ? "text-muted-foreground"
              : "text-destructive hover:text-destructive/80"
          }`}
          onClick={deleting ? undefined : handleDelete}
        />
      </div>
    </div>
  );
}