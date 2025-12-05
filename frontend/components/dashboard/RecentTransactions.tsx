import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Transaction {
  id: string
  name: string
  event: string
  initials: string
  amount: string
}

const recentTransactions: Transaction[] = [
  { id: "1", name: "Rahul Kumar", event: "Tech Conference 2024", initials: "RK", amount: "₹2,500" },
  { id: "2", name: "Priya Singh", event: "Music Festival", initials: "PS", amount: "₹1,800" },
  { id: "3", name: "Amit Patel", event: "Food Carnival", initials: "AP", amount: "₹3,200" },
]

export function RecentTransactions() {
  return (
    <Card className="bg-linear-to-br from-purple-50 via-indigo-50 to-blue-50 border-none shadow-md">
      <CardHeader>
        <CardTitle className="font-semibold text-lg">Recent Transactions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-all cursor-pointer border border-transparent hover:border-indigo-200"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 bg-linear-to-br from-purple-400 to-indigo-500 text-white shadow-sm">
                <AvatarFallback className="text-white font-semibold">
                  {transaction.initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-medium">{transaction.name}</p>
                <p className="text-sm text-muted-foreground">{transaction.event}</p>
              </div>
            </div>

            <p className="font-semibold text-indigo-600">{transaction.amount}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
