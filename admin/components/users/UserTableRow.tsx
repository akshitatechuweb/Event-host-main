"use client";

import { Eye, Trash2 } from "lucide-react";

interface UserTableRowProps {
  user: {
    name: string;
    email: string;
    phone: string;
    city: string;
    status: "active" | "inactive";
  };
  onView?: () => void;
  onDeactivate?: () => void;
}

export function UserTableRow({ user, onView, onDeactivate }: UserTableRowProps) {
  const statusColors = {
    active: "bg-chart-1/10 text-chart-1",
    inactive: "bg-muted text-muted-foreground",
  };

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-border hover:bg-muted/30 transition-smooth group">
      <div className="text-sm font-medium text-foreground">{user.name}</div>
      <div className="text-sm text-muted-foreground">{user.email || "N/A"}</div>
      <div className="text-sm text-muted-foreground">{user.phone}</div>
      <div className="text-sm text-muted-foreground">{user.city || "N/A"}</div>
      <div>
        <span
          className={`text-xs px-2 py-1 rounded-md font-medium ${statusColors[user.status]}`}
        >
          {user.status}
        </span>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
        {onView && (
          <button
            onClick={onView}
            className="p-1.5 hover:bg-card rounded transition-smooth"
          >
            <Eye className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        {onDeactivate && user.status === "active" && (
          <button
            onClick={onDeactivate}
            className="p-1.5 hover:bg-card rounded transition-smooth"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        )}
      </div>
    </div>
  );
}