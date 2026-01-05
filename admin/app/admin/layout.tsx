"use client";

import { usePathname } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { Sidebar } from "@/components/common/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        {!isLogin && <Sidebar />}

        <main className={`flex-1 ${!isLogin ? "ml-60 p-8" : ""}`}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
