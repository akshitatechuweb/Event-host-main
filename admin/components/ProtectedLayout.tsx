import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-utils";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const authResult = await checkAuth();

    // If auth check fails or user is not authenticated, redirect to login
    if (!authResult.success || !authResult.user) {
      redirect("/login");
    }

    const role = authResult.user.role;

    // Only allow admin and superadmin roles
    if (role !== "admin" && role !== "superadmin") {
      redirect("/login");
    }

    return <>{children}</>;
  } catch (error) {
    // If there's any error during auth check, redirect to login
    console.error("ProtectedLayout auth error:", error);
    redirect("/login");
  }
}
