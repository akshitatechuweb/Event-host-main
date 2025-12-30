"use client";

import { LogOut } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

export function SidebarFooter() {
  const { handleLogout } = useLogout();

  return (
    <button
      onClick={handleLogout}
      className="
        group flex w-full items-center gap-3 rounded-xl px-3 py-2.5
        text-sm font-medium text-muted-foreground
        hover:bg-red-500/10 hover:text-red-500
        transition-smooth
      "
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/40 group-hover:bg-red-500/15 transition">
        <LogOut className="h-4 w-4" />
      </span>
      <span>Sign Out</span>
    </button>
  );
}
