"use client";
import React, { useState } from "react";
import {
  Sidebar as SidebarContainer,
  SidebarBody,
  SidebarLink,
} from "../ui/sidebar";
import {
  IconBrandTabler,
  IconCalendar,
  IconUsers,
  IconUserBolt,
  IconTicket,
  IconCash,
  IconUser,
  IconSettings,
  IconLogout,
  IconSun,
  IconMoon,
  IconShieldLock,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/useLogout";
import { useQuery } from "@tanstack/react-query";
import { getAdminProfile } from "@/lib/admin";
import { Loader2, User as UserIcon } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout, loading } = useLogout();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: () => getAdminProfile(),
  });

  const toggleTheme = () => {
    const root = document.documentElement;
    root.classList.toggle("dark");
    localStorage.theme = root.classList.contains("dark") ? "dark" : "light";
  };

  const links = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Events",
      href: "/admin/events",
      icon: (
        <IconCalendar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Hosts",
      href: "/admin/hosts",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "App Users",
      href: "/admin/app-users",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Tickets",
      href: "/admin/tickets",
      icon: (
        <IconTicket className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Transactions",
      href: "/admin/transactions",
      icon: (
        <IconCash className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "/admin/profile",
      icon: (
        <IconUser className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    ...(profile?.role === "superadmin"
      ? [
          {
            label: "Admins",
            href: "/admin/admins",
            icon: (
              <IconShieldLock className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
          },
          {
            label: "Coupons",
            href: "/admin/coupons",
            icon: (
              <IconTicket className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            ),
          },
        ]
      : []),
  ];

  return (
    <SidebarContainer open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 backdrop-blur-md transition-all duration-300">
        <div className="flex flex-1 flex-col overflow-x-hidden">
          {open ? (
            <Logo profile={profile} isLoading={isProfileLoading} />
          ) : (
            <LogoIcon profile={profile} isLoading={isProfileLoading} />
          )}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink
                key={idx}
                link={link}
                className={cn(
                  "rounded-xl px-2 transition-all duration-200",
                  pathname === link.href
                    ? "bg-sidebar-primary/10 text-sidebar-primary"
                    : "hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-xl hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all duration-200"
          >
            <div className="relative h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200">
              <IconSun className="h-5 w-5 dark:hidden" />
              <IconMoon className="hidden h-5 w-5 dark:block" />
            </div>
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-neutral-700 dark:text-neutral-200 text-sm whitespace-pre font-medium"
            >
              Toggle Theme
            </motion.span>
          </button>

          <button
            onClick={logout}
            disabled={loading}
            className="flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-xl hover:bg-red-500/5 text-neutral-500 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
          >
            <IconLogout className="h-5 w-5 shrink-0 opacity-70 group-hover:opacity-100" />
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="text-sm whitespace-pre font-medium"
            >
              {loading ? "Logging out..." : "Logout"}
            </motion.span>
          </button>
        </div>
      </SidebarBody>
    </SidebarContainer>
  );
}

export const Logo = ({
  profile,
  isLoading,
}: {
  profile?: any;
  isLoading?: boolean;
}) => {
  return (
    <div className="flex items-center space-x-3 py-1 text-sm font-normal text-black dark:text-white">
      <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden bg-sidebar-primary flex items-center justify-center shadow-sm border border-neutral-200 dark:border-neutral-800">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : profile?.profilePhoto ? (
          <img
            src={profile.profilePhoto}
            alt="Admin"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-white font-black text-sm">U</span>
        )}
      </div>
      <div className="flex flex-col">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-bold text-base tracking-tight text-neutral-800 dark:text-neutral-100 whitespace-nowrap"
        >
          UnrealVibe
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black -mt-1 whitespace-nowrap"
        >
          Admin Portal
        </motion.span>
      </div>
    </div>
  );
};

export const LogoIcon = ({
  profile,
  isLoading,
}: {
  profile?: any;
  isLoading?: boolean;
}) => {
  return (
    <div className="flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white">
      <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden bg-sidebar-primary flex items-center justify-center shadow-sm border border-neutral-200 dark:border-neutral-800">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-white" />
        ) : profile?.profilePhoto ? (
          <img
            src={profile.profilePhoto}
            alt="Admin"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-white font-black text-sm">U</span>
        )}
      </div>
    </div>
  );
};
