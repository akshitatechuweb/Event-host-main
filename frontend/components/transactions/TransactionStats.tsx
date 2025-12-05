"use client"

import { DollarSign, TrendingUp, CreditCard, Users } from "lucide-react"

export function TransactionStats() {
  const stats = [
    {
      title: "Total Revenue",
      value: "₹12.4L",
      change: "+12.5%",
      icon: DollarSign,
      bgColor: "from-green-500 to-emerald-600"
    },
    {
      title: "Total Transactions",
      value: "1,847",
      change: "+8.2%",
      icon: TrendingUp,
      bgColor: "from-blue-500 to-indigo-600"
    },
    {
      title: "Successful Payments",
      value: "98.5%",
      change: "+2.1%",
      icon: CreditCard,
      bgColor: "from-purple-500 to-indigo-500"
    },
    {
      title: "Unique Customers",
      value: "1,234",
      change: "+15.3%",
      icon: Users,
      bgColor: "from-pink-500 to-rose-600"
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.title} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium mt-2">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-linear-to-br ${stat.bgColor}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}