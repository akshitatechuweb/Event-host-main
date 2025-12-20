"use client";

import { Eye } from "lucide-react";

interface HostTableRowProps {
  host: {
    userName: string;
    phone: string;
    city: string;
    preferredPartyDate: string;
    status: "pending" | "approved" | "rejected";
  };
  onView: () => void;
}

export function HostTableRow({ host, onView }: HostTableRowProps) {
  const statusColors = {
    pending: "bg-accent/10 text-accent-foreground",
    approved: "bg-chart-1/10 text-chart-1",
    rejected: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border hover:bg-muted/30 group">
      <div className="text-sm font-medium">
        {host.userName}
        <div className="text-xs text-muted-foreground">
          {host.phone}
        </div>
      </div>

      <div className="text-sm">{host.city}</div>

      <div className="text-sm">
        {new Date(host.preferredPartyDate).toLocaleDateString()}
      </div>

      <div>
        <span
          className={`text-xs px-2 py-1 rounded-md font-medium ${statusColors[host.status]}`}
        >
          {host.status}
        </span>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={onView}
          className="p-1.5 hover:bg-card rounded"
        >
          <Eye className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
