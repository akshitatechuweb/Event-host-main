"use client";

import { Eye, Check,Layers, X } from "lucide-react";
import { Host, HostStatus } from "@/types/host"; // ← Add HostStatus here
import { approveHost, rejectHost } from "@/lib/admin";
import { useState } from "react";
import HostDetailsModal from "./HostDetailsModal";
import { HostEventsModal } from "./HostEventsModal"; // Added Modal

// Now this works perfectly
const STATUS_STYLES: Record<HostStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-600",
  approved: "bg-emerald-500/15 text-emerald-600",
  rejected: "bg-red-500/15 text-red-600",
};

export function HostTableRow({
  host,
  onActionComplete,
  canEdit = false,
}: {
  host: Host;
  onActionComplete: () => void;
  canEdit?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  // Add this line below to fix the ReferenceError
  const [showEvents, setShowEvents] = useState(false); 
  const handleApprove = async () => {
    await approveHost(host._id);
    onActionComplete();
  };

  const handleReject = async () => {
    await rejectHost(host._id);
    onActionComplete();
  };

  // Safe access with fallback
  const statusStyle = host.status
    ? STATUS_STYLES[host.status]
    : "bg-gray-500/15 text-gray-600";
  const displayStatus = host.status ?? "unknown";

  return (
    <div className="grid grid-cols-6 gap-4 px-6 py-5 border-b border-border">
      <div>
        <p className="font-medium">{host.userName}</p>
        <p className="text-xs text-muted-foreground">{host.phone}</p>
      </div>

      <div>{host.city}</div>

      <div>
        {host.preferredPartyDate
          ? new Date(host.preferredPartyDate).toLocaleDateString()
          : "-"}
      </div>

      <div>
        <span className={`text-xs px-3 py-1 rounded-full ${statusStyle}`}>
          {displayStatus}
        </span>
      </div>

      <div className="flex justify-center gap-2">
        <button
          className="icon-btn"
          onClick={() => setShowDetails(true)}
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </button>

<button
    className="icon-btn"
    onClick={() => setShowEvents(true)}
    title="View host events"
  >
    <Layers className="w-4 h-4" />
  </button>
        {host.status === "pending" && canEdit && (
          <>
            <button
              onClick={handleApprove}
              className="icon-btn text-emerald-500"
              title="Approve request"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleReject}
              className="icon-btn text-red-500"
              title="Reject request"
            >
              <X className="w-4 h-4" />
            </button>
            
          </>
        )}

        <HostDetailsModal
          hostId={host._id}
          open={showDetails}
          onOpenChange={(o) => setShowDetails(o)}
          onActionComplete={onActionComplete}
        />
        <HostEventsModal
          hostId={host.realUserId || host._id}
          hostName={host.userName}
          open={showEvents}
          onOpenChange={setShowEvents}
        />
      </div>
    </div>
  );
}
