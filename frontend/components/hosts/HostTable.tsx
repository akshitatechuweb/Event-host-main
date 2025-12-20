"use client";

import { HostTableHeader } from "./HostTableHeader";
import { HostTableRow } from "./HostTableRow";

interface HostTableProps {
  onView: () => void;
}

export function HostTable({ onView }: HostTableProps) {
  const hostRequests = [
    {
      userName: "John Doe",
      phone: "9999999999",
      city: "Delhi",
      preferredPartyDate: "2025-02-15",
      status: "pending" as const,
    },
    {
      userName: "Jane Smith",
      phone: "8888888888",
      city: "Mumbai",
      preferredPartyDate: "2025-02-20",
      status: "approved" as const,
    },
    {
      userName: "Mike Johnson",
      phone: "7777777777",
      city: "Bangalore",
      preferredPartyDate: "2025-03-01",
      status: "rejected" as const,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <HostTableHeader />
      <div>
        {hostRequests.map((host, index) => (
          <HostTableRow
            key={index}
            host={host}
            onView={onView}
          />
        ))}
      </div>
    </div>
  );
}
