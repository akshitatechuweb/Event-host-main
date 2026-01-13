"use client";

import { useQuery } from "@tanstack/react-query";
import { getHostEvents } from "@/lib/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Calendar } from "lucide-react";

const formatDate = (date: any) => {
  if (!date) return "TBA";
  const d = new Date(date);
  return isNaN(d.getTime()) ? "TBA" : d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function HostEventsModal({ hostId, hostName, open, onOpenChange }: any) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["host-events", hostId],
    queryFn: () => getHostEvents(hostId),
    enabled: open,
  });

  const events = data?.events || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Events by {hostName}</DialogTitle>
          <DialogDescription>
            View all events organized by this host.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin w-8 h-8 text-sidebar-primary" />
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-destructive/5 text-destructive text-center text-sm border border-destructive/10">
              Error fetching events
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-muted/5 rounded-3xl border border-dashed border-border/50">
              <Calendar className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p>No events found for this host.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {events.map((ev: any) => (
                <div key={ev._id} className="group flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-card hover:bg-muted/5 transition-all">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground group-hover:text-sidebar-primary transition-colors">
                      {ev.eventName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <span className="capitalize">{ev.city}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{formatDate(ev.date || ev.eventDateTime)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                      {ev.category || "General"}
                    </div>
                    <div className="text-xs font-semibold bg-sidebar-primary/5 text-sidebar-primary px-3 py-1 rounded-full">
                      {ev.currentBookings || 0} / {ev.maxCapacity || "∞"} Bookings
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
