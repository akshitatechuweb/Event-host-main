import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tickets - Event Host",
  description: "Manage event tickets",
};

export default function TicketsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
