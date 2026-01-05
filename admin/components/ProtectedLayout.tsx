import type { ReactNode } from "react";

/**
 * ProtectedLayout
 *
 * Auth is already enforced by middleware.ts.
 * This component ONLY provides a stable wrapper.
 */
export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
