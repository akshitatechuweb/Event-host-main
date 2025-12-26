"use client";

import { Host } from "@/types/host";
import { HostTableHeader } from "./HostTableHeader";
import { HostTableRow } from "./HostTableRow";

interface HostTableProps {
  hosts: Host[];
  onActionComplete: () => void;
}

export function HostTable({ hosts, onActionComplete }: HostTableProps) {
  if (hosts.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-black/40 border border-border p-6 text-center">
        No hosts found
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-white dark:bg-black/40 border border-border">
      <HostTableHeader />
      {hosts.map((host) => (
        <HostTableRow
          key={host._id}
          host={host}
          onActionComplete={onActionComplete}
        />
      ))}
    </div>
  );
}
