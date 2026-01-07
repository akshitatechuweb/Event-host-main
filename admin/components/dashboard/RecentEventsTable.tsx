"use client";

import { useEffect, useState } from "react";
import { clientFetch } from "@/lib/client";
import { Loader2 } from "lucide-react";

interface RecentEvent {
  id: string;
  name: string;
  host: string;
  date: string;
  attendees: number;
}

export function RecentEventsTable() {
  const [events, setEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchEvents(): Promise<void> {
      try {
        const response = await clientFetch("/dashboard/stats");
        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.recentEvents)) {
          setEvents(data.recentEvents);
        } else {
          setEvents([]);
        }
      } catch (error: unknown) {
        console.error("Error fetching events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Events</h2>
          <p className="text-sm text-muted-foreground">
            Latest event activity
          </p>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-lg font-semibold">Recent Events</h2>
        <p className="text-sm text-muted-foreground">
          Latest event activity
        </p>
      </div>

      {/* Table */}
      {events.length === 0 ? (
        <div className="px-6 py-12 text-center text-muted-foreground">
          No events found
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-muted/40">
            <tr>
              {["Event", "Host", "Date", "Attendees"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium">{e.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{e.host}</td>
                <td className="px-6 py-4 text-muted-foreground">{e.date}</td>
                <td className="px-6 py-4 text-right font-semibold">
                  {e.attendees}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
