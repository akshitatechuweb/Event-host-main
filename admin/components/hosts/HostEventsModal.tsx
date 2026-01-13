"use client";

import { useQuery } from "@tanstack/react-query";
import { getHostEvents } from "@/lib/admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle,DialogDescription } from "@/components/ui/dialog";
import { Loader2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HostEventsModal({ hostId, hostName, open, onOpenChange }: any) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["host-events", hostId],
    queryFn: () => getHostEvents(hostId),
    enabled: open,
  });

  const events = data?.events || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Events by {hostName}</DialogTitle>
           <DialogDescription>
      A list of all events organized by this host.
    </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
          ) : error ? (
            <p className="text-center text-destructive">Error loading events</p>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground">No events found</p>
          ) : (
            <div className="space-y-3">
              {events.map((ev: any) => (
                <div key={ev._id} className="flex justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{ev.eventName}</p>
                    <p className="text-xs text-muted-foreground">{ev.city} • {new Date(ev.eventDate).toLocaleDateString()}</p>
                  </div>
                  <Badge>{ev.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
