"use client";

import { useLogout } from "@/hooks/useLogout";

export function SidebarFooter() {
  const { logout, loading } = useLogout();

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="
        flex w-full items-center gap-3 rounded-xl px-3 py-2.5
        text-sm font-medium text-muted-foreground
        hover:bg-sidebar-accent/50 hover:text-sidebar-foreground
        transition-smooth
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/40">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </span>
      <span>{loading ? "Logging out..." : "Logout"}</span>
    </button>
  );
}