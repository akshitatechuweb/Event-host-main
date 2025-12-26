"use client";

import { Eye, Check, X } from "lucide-react";
import { Host } from "@/types/host";
import { approveHost, rejectHost } from "@/lib/admin";

const STATUS_STYLES: Record<Host["status"], string> = {
  pending: "bg-yellow-500/15 text-yellow-600",
  approved: "bg-emerald-500/15 text-emerald-600",
  rejected: "bg-red-500/15 text-red-600",
};

export function HostTableRow({
  host,
  onActionComplete,
}: {
  host: Host;
  onActionComplete: () => void;
}) {
  const handleApprove = async () => {
    await approveHost(host._id);
    onActionComplete();
  };

  const handleReject = async () => {
    await rejectHost(host._id);
    onActionComplete();
  };

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-5 border-b border-border">
      <div>
        <p className="font-medium">{host.userName}</p>
        <p className="text-xs text-muted-foreground">{host.phone}</p>
      </div>

      <div>{host.city}</div>
      <div>{new Date(host.preferredPartyDate).toLocaleDateString()}</div>

      <div>
        <span className={`text-xs px-3 py-1 rounded-full ${STATUS_STYLES[host.status]}`}>
          {host.status}
        </span>
      </div>

      <div className="flex justify-center gap-2">
        <button className="icon-btn">
          <Eye className="w-4 h-4" />
        </button>

        {host.status === "pending" && (
          <>
            <button onClick={handleApprove} className="icon-btn text-emerald-500">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={handleReject} className="icon-btn text-red-500">
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
