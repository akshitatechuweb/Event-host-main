"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Eye } from "lucide-react";

// Import the SINGLE source of truth for Event
import { Event } from "@/types/event";

interface EventTableRowProps {
  event: Event;
  onRefresh: () => void;
  onEdit?: (event: Event) => void;
  onViewTransactions?: (eventId: string, eventName?: string) => void;
}

export function EventTableRow({
  event,
  onEdit,
  onViewTransactions,
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
        {event.eventImage ? (
          <img
            src={event.eventImage}
            alt={event.eventName}
            className="h-full w-full object-cover"
            onError={(e) => {
              const transparent1px = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAA6fptVAAAADUlEQVQI12NgYGBgAAAABQABDQottAAAAABJRU5ErkJggg==";
              const placeholderPath = "/placeholder.svg";

              const src = e.currentTarget.src || "";
              // If we've already tried the data URI, stop to avoid loop
              if (src === transparent1px) return;

              // First try to load the app-level placeholder; if that fails next onError will trigger and we'll fall back to the data URI
              if (src.includes("placeholder.svg")) {
                e.currentTarget.src = transparent1px;
              } else {
                e.currentTarget.src = placeholderPath;
              }
            }}
          />
        ) : (
          <span className="text-xs text-black/40 dark:text-white/40">
            No Image
          </span>
        )}
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
            onClick={() =>
              onViewTransactions(event._id, event.eventName)
            }
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}

        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(event)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}