"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Eye } from "lucide-react";
import { CldImage } from "../common/CldImage";

// Import the SINGLE source of truth for Event
import { Event } from "@/types/event";

interface EventTableRowProps {
  event: Event;
  onRefresh: () => void;
  onEdit?: (event: Event) => void;
  onViewTransactions?: (eventId: string, eventName?: string) => void;
  canEdit?: boolean;
}

export function EventTableRow({
  event,
  onEdit,
  onViewTransactions,
  canEdit = false,
}: EventTableRowProps) {
  // Safe fallback: if maxCapacity is somehow missing (shouldn't happen with correct type)
  const maxCapacity = event.maxCapacity ?? 0;
  const bookingPercentage =
    maxCapacity > 0
      ? Math.round((event.currentBookings / maxCapacity) * 100)
      : 0;

  return (
    <div className="grid grid-cols-[64px_2fr_1.5fr_1fr_1fr_1fr] items-center gap-4 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition">
      {/* =========================
          EVENT IMAGE
      ========================== */}
      <div className="h-12 w-12 rounded-lg overflow-hidden bg-black/10 dark:bg-white/10 flex items-center justify-center">
        <CldImage
          src={event.eventImage}
          transformation="thumbnail"
          alt={event.eventName}
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Event Name */}
      <div className="flex flex-col">
        <span className="font-medium text-black dark:text-white">
          {event.eventName}
        </span>
        <span className="text-xs text-black/50 dark:text-white/50">
          Hosted by {event.hostedBy}
        </span>
      </div>

      {/* City */}
      <div className="text-sm text-black/70 dark:text-white/70">
        {event.city}
      </div>

      {/* Date */}
      <div className="text-sm text-black/70 dark:text-white/70">
        {new Date(event.date).toLocaleDateString()}
      </div>

      {/* Capacity */}
      <div className="text-sm text-black/70 dark:text-white/70">
        {event.currentBookings}/{event.maxCapacity} ({bookingPercentage}%)
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        {onViewTransactions && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewTransactions(event._id, event.eventName)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}

        {onEdit && canEdit && (
          <Button variant="ghost" size="icon" onClick={() => onEdit(event)}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
