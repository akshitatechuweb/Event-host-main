import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | number
  change: string
  changeType: "positive" | "negative"
  icon: ReactNode
  iconBgColor: string
}

export function StatCard({ title, value, change, changeType, icon, iconBgColor }: StatCardProps) {
  return (
    <Card className="shadow-md border-none bg-linear-to-br from-purple-50 via-indigo-50 to-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>

            <p className={`mt-1 text-sm font-semibold ${changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
              {changeType === "positive" ? "+" : "-"} {change}
            </p>
          </div>

          <div
            className={`rounded-xl p-4 shadow-sm ${iconBgColor} text-white flex items-center justify-center`}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
