"use client";

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  CreditCard,
  Moon,
  Sun,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarFooter } from "./SidebarFooter";

type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

const navItems: readonly NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: Users, label: "Hosts", href: "/hosts" },
  { icon: Ticket, label: "Tickets", href: "/tickets" },
  { icon: CreditCard, label: "Transactions", href: "/transactions" },
  { icon: Users, label: "Users", href: "/users" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    localStorage.theme = root.classList.contains("dark") ? "dark" : "light";
  };

  return (
    <aside
      className="
        fixed left-0 top-0 z-40 h-screen w-60
        bg-[var(--sidebar-gradient)]
        backdrop-blur-xl
        border-r border-sidebar-border
        shadow-[var(--shadow-premium)]
        flex flex-col
      "
    >
      {/* Brand */}
      <div className="px-6 py-8">
        <h1 className="text-xl font-semibold tracking-tight text-sidebar-foreground">
          Event Host
        </h1>
        <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
          Admin Portal
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center gap-3 rounded-xl px-3 py-2.5
                text-sm font-medium transition-smooth
                ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }
              `}
            >
              <span
                className={`
                  flex h-9 w-9 items-center justify-center rounded-lg
                  transition-smooth
                  ${
                    isActive
                      ? "bg-sidebar-primary/15 text-sidebar-primary"
                      : "bg-muted/40 group-hover:bg-sidebar-primary/10"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
              </span>

              <span>{item.label}</span>

              {isActive && (
                <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-pink-500/10 to-violet-500/10" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-5 border-t border-sidebar-border space-y-2">
        <SidebarFooter />

        <button
          onClick={toggleTheme}
          className="
            flex w-full items-center gap-3 rounded-xl px-3 py-2.5
            text-sm font-medium text-muted-foreground
            hover:bg-sidebar-accent/50 hover:text-sidebar-foreground
            transition-smooth
          "
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/40">
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </span>
          <span>Toggle Theme</span>
        </button>
      </div>
    </aside>
  );
}
