"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Zap, Calendar, Ticket, CreditCard } from "lucide-react"
import { LogoutSection } from "../dashboard/LogoutSection"

const navigationItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Users", icon: Users, href: "/users" },
  { label: "Hosts", icon: Zap, href: "/hosts" },
  { label: "Events", icon: Calendar, href: "/events" },
  { label: "Tickets", icon: Ticket, href: "/tickets" },
  { label: "Transactions", icon: CreditCard, href: "/transactions" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-linear-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-xl flex flex-col border-r border-white/10">
      
      {/* Logo Section */}
      <div className="border-b border-white/20 px-6 py-5">
        <h1 className="text-xl font-bold tracking-wide">Event Host</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all cursor-pointer
                  ${isActive
                    ? "bg-white/20 shadow-sm backdrop-blur-md"
                    : "hover:bg-white/10"
                  }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Logout Section */}
      <LogoutSection />
    </aside>
  )
}