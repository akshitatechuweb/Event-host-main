"use client";

import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  CreditCard,
  UserCircle, // ✅ NEW
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { Moon, Sun } from "lucide-react";
import { SidebarFooter } from "./SidebarFooter";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: Users, label: "Hosts", href: "/hosts" },
  { icon: Ticket, label: "Tickets", href: "/tickets" },
  { icon: CreditCard, label: "Transactions", href: "/transactions" },

  // 👥 All users
  { icon: Users, label: "Users", href: "/users" },

];

export function Sidebar() {
  const pathname = usePathname();

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    localStorage.theme = root.classList.contains("dark") ? "dark" : "light";
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[var(--sidebar-gradient)] flex flex-col shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)] dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)]">
      <div className="px-6 py-8 border-none">
        <h1 className="text-xl font-semibold tracking-tight text-sidebar-foreground">
          Event Host
        </h1>
        <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">
          Admin Portal
        </p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isProfile = item.href === "/profile";
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
                transition-smooth group
                ${
                  isActive
                    ? isProfile
                      ? "bg-gradient-to-r from-pink-500/10 to-violet-500/10 text-sidebar-foreground"
                      : "bg-gradient-to-r from-white/6 to-white/2 text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-white/4 hover:text-sidebar-foreground"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-6 border-t border-sidebar-border">
        <SidebarFooter/>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition w-full"
        >
          <Sun className="w-4 h-4 dark:hidden" />
          <Moon className="w-4 h-4 hidden dark:block" />
          <span>Toggle Theme</span>
        </button>
      </div>
    </aside>
  );
}
