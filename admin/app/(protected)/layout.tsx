import type { ReactNode } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";

export default function ProtectedRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
