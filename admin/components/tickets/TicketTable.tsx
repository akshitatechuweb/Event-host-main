"use client";

import { useMemo } from "react";
import { getAllTickets } from "@/lib/admin";
import { Loader2 } from "lucide-react";
import { EventTicketCard } from "./EventTicketCard";
import { filterBySearchQuery } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Pagination } from "../ui/Pagination";

interface Ticket {
  _id: string;
  eventId: string;
  eventName: string;
  ticketType: string;
  price: number;
  total: number;
  sold: number;
  available: number;
}

interface TicketTableProps {
  searchQuery?: string;
}

export function TicketTable({ searchQuery = "" }: TicketTableProps) {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const debouncedQuery = useDebouncedValue(searchQuery, 250);

  const { data, isLoading, error } = useQuery({
    queryKey: ["tickets", page, limit],
    queryFn: () => getAllTickets(page, limit),
  });

  const tickets = data?.tickets || [];
  const meta = data?.meta;

  const filteredTickets = useMemo(
    () =>
      filterBySearchQuery(tickets as Ticket[], debouncedQuery, (ticket) => [
        ticket.eventName,
        ticket.ticketType,
      ]),
    [tickets, debouncedQuery]
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 rounded-3xl border border-border/50 bg-muted/10 glass-morphism">
        <Loader2 className="w-10 h-10 animate-spin text-sidebar-primary mb-4" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Scanning ticket inventory...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl border border-destructive/20 bg-destructive/5 text-center">
        <p className="text-sm text-destructive font-medium">
          {error instanceof Error ? error.message : "Failed to load tickets"}
        </p>
      </div>
    );
  }

  const grouped = filteredTickets.reduce<Record<string, Ticket[]>>((acc, t) => {
    acc[t.eventName] = acc[t.eventName] || [];
    acc[t.eventName].push(t);
    return acc;
  }, {});

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 rounded-3xl border border-border/50 bg-muted/10">
        <p className="text-sm text-muted-foreground">
          No tickets found matches your search or inventory is empty.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        {Object.entries(grouped).map(([eventName, passes]) => (
          <EventTicketCard
            key={eventName}
            eventName={eventName}
            passes={passes}
          />
        ))}
      </div>

      {meta && (
        <div className="mt-8 border-t border-border/30 pt-4">
          <Pagination
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            limit={meta.limit}
          />
        </div>
      )}
    </div>
  );
}
