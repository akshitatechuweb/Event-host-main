import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Users - Event Host",
  description: "Manage all users",
};

export default function UsersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
