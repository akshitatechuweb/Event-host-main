"use client"

export function RecentEventsTable() {
  const events = [
    { id: 1, name: "Summer Music Festival", host: "John Doe", date: "Jul 15, 2024", attendees: 450 },
    { id: 2, name: "Tech Conference 2024", host: "Jane Smith", date: "Aug 22, 2024", attendees: 320 },
    { id: 3, name: "Art Gallery Opening", host: "Mike Johnson", date: "Sep 10, 2024", attendees: 180 },
    { id: 4, name: "Food & Wine Expo", host: "Sarah Williams", date: "Oct 5, 2024", attendees: 280 },
  ]

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Recent Events</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Latest event activity</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Event Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Host
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Attendees
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((event) => (
              <tr key={event.id} className="hover:bg-muted/30 transition-smooth">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{event.name}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{event.host}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{event.date}</td>
                <td className="px-6 py-4 text-sm text-foreground text-right font-medium">{event.attendees}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
