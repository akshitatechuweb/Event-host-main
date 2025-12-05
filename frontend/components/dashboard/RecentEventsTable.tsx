import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Event {
  id: string
  name: string
  host: string
  date: string
  attendees: number
  status: "Active" | "Pending" | "Completed"
}

const recentEvents: Event[] = [
  { id: "1", name: "Tech Conference 2024", host: "John Doe", date: "15 Dec, 2024", attendees: 150, status: "Active" },
  { id: "2", name: "Music Festival", host: "Jane Smith", date: "20 Dec, 2024", attendees: 300, status: "Active" },
  { id: "3", name: "Food Carnival", host: "Mike Johnson", date: "25 Dec, 2024", attendees: 892, status: "Pending" },
  { id: "4", name: "Art Exhibition", host: "Sarah Williams", date: "28 Dec, 2024", attendees: 452, status: "Active" },
]

function getStatusColor(status: Event["status"]) {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700"
    case "Pending":
      return "bg-yellow-100 text-yellow-700"
    case "Completed":
      return "bg-gray-200 text-gray-700"
    default:
      return "bg-gray-200 text-gray-700"
  }
}

export function RecentEventsTable() {
  return (
    <Card className="rounded-2xl border-none bg-linear-to-br from-purple-100 via-indigo-50 to-blue-100 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Recent Events
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader className="bg-white/50 backdrop-blur-md">
            <TableRow>
              <TableHead className="text-gray-700 font-semibold">Event Name</TableHead>
              <TableHead className="text-gray-700 font-semibold">Host</TableHead>
              <TableHead className="text-gray-700 font-semibold">Date</TableHead>
              <TableHead className="text-gray-700 font-semibold">Attendees</TableHead>
              <TableHead className="text-gray-700 font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {recentEvents.map((event) => (
              <TableRow
                key={event.id}
                className="hover:bg-white/60 transition-all cursor-pointer"
              >
                <TableCell className="font-medium text-gray-800">{event.name}</TableCell>
                <TableCell className="text-gray-700">{event.host}</TableCell>
                <TableCell className="text-gray-700">{event.date}</TableCell>
                <TableCell className="text-gray-700">{event.attendees}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(event.status)} px-3 py-1 rounded-lg`}>
                    {event.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
