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

// FIXED: Added /admin prefix to match your folder structure
const navItems: readonly NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: Calendar, label: "Events", href: "/admin/events" },
  { icon: Users, label: "Hosts", href: "/admin/hosts" },
  { icon: Ticket, label: "Tickets", href: "/admin/tickets" },
  { icon: CreditCard, label: "Transactions", href: "/admin/transactions" },
  { icon: Users, label: "Users", href: "/admin/users" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    localStorage.theme = root.classList.contains("dark") ? "dark" : "light";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-card border-r border-border flex flex-col">
      <div className="px-6 py-8">
        <h1 className="text-xl font-bold tracking-tight">UnrealVibe</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">Admin</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          // Check if active (handles nested routes)
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <SidebarFooter />
        <button onClick={toggleTheme} className="flex w-full items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">
          <Sun className="h-4 w-4 dark:hidden" />
          <Moon className="hidden h-4 w-4 dark:block" />
          <span>Theme</span>
        </button>
      </div>
    </aside>
  );
}