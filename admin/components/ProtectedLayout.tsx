import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-utils";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authResult = await checkAuth();

  if (!authResult.success || !authResult.user) {
    redirect("/login");
  }

  const role = authResult.user.role;

  // Only allow admin and superadmin roles
  if (role !== "admin" && role !== "superadmin") {
    redirect("/login");
  }

  return <>{children}</>;
}
