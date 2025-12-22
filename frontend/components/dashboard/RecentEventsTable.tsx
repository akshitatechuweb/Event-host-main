"use client";

export function RecentEventsTable() {
  const events = [
    { id: 1, name: "Summer Music Festival", host: "John Doe", date: "Jul 15, 2024", attendees: 450 },
    { id: 2, name: "Tech Conference 2024", host: "Jane Smith", date: "Aug 22, 2024", attendees: 320 },
    { id: 3, name: "Art Gallery Opening", host: "Mike Johnson", date: "Sep 10, 2024", attendees: 180 },
    { id: 4, name: "Food & Wine Expo", host: "Sarah Williams", date: "Oct 5, 2024", attendees: 280 },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-lg font-semibold">Recent Events</h2>
        <p className="text-sm text-muted-foreground">Latest event activity</p>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead className="bg-muted/40">
          <tr>
            {["Event", "Host", "Date", "Attendees"].map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {events.map((e) => (
            <tr
              key={e.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <td className="px-6 py-4 font-medium">{e.name}</td>
              <td className="px-6 py-4 text-muted-foreground">{e.host}</td>
              <td className="px-6 py-4 text-muted-foreground">{e.date}</td>
              <td className="px-6 py-4 text-right font-semibold">{e.attendees}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
