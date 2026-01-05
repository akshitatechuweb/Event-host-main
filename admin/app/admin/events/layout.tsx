import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Events - Event Host",
  description: "Manage all events",
};

export default function EventsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
