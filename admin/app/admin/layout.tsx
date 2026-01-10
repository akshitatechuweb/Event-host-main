"use client";

import { usePathname } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/common/Sidebar";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <AuthGuard>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        {!isLogin && <Sidebar />}

        <main className="flex-1">
          <div className={cn(!isLogin ? "p-4 md:p-8" : "")}>
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
