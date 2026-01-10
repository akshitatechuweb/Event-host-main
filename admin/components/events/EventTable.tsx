"use client";

import { useMemo } from "react";
import { EventTableHeader } from "./EventTableHeader";
import { EventTableRow } from "./EventTableRow";
import { toast } from "sonner";
import { filterBySearchQuery } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useQuery } from "@tanstack/react-query";
import { getAllEvents } from "@/lib/admin";
import { useSearchParams } from "next/navigation";
import { Pagination } from "../ui/Pagination";
import { Loader2 } from "lucide-react";

// Shared Event type
import { Event } from "@/types/event";

interface EventTableProps {
  onEdit?: (event: Event) => void;
  onViewTransactions?: (eventId: string, eventName?: string) => void;
  searchQuery?: string;
}

export function EventTable({
  onEdit,
  onViewTransactions,
  searchQuery = "",
}: EventTableProps) {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const debouncedQuery = useDebouncedValue(searchQuery, 250);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["events", page, limit],
    queryFn: () => getAllEvents(page, limit),
  });

  const events = data?.events || [];
  const meta = data?.meta;

  const filteredEvents = useMemo(
    () =>
      filterBySearchQuery(events as Event[], debouncedQuery, (event) => [
        event.eventName,
        event.hostedBy,
        event.city,
      ]),
    [events, debouncedQuery]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Syncing events...</p>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-t border-border/50">
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
          <Loader2 className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <p className="text-muted-foreground font-medium">No events found</p>
        <p className="text-sm text-muted-foreground/60 max-w-[250px] mt-1">
          Try adjusting your search or create your first event
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="divide-y divide-border">
        <EventTableHeader />
        {filteredEvents.map((event) => (
          <EventTableRow
            key={event._id}
            event={event}
            onRefresh={refetch}
            onEdit={onEdit}
            onViewTransactions={onViewTransactions}
          />
        ))}
      </div>
      
      {meta && meta.totalPages > 1 && (
        <div className="border-t border-border/50 bg-muted/5">
          <Pagination 
            currentPage={meta.currentPage} 
            totalPages={meta.totalPages} 
          />
        </div>
      )}
    </div>
  );
}
