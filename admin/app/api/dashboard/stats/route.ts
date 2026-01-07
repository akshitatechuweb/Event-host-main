import { NextRequest, NextResponse } from "next/server";

/**
 * Dashboard stats MUST NEVER fail.
 * It returns best-effort data only.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const headers = { cookie: req.headers.get("cookie") || "" };

  const safeFetch = async (url: string) => {
    try {
      const res = await fetch(url, { headers, cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  // 🔑 Fetch independently — no Promise.all fail cascade
  const eventsData = await safeFetch(`${origin}/api/admin/events`);
  const bookingsData = await safeFetch(`${origin}/api/booking/admin`);
  const usersData = await safeFetch(`${origin}/api/user?summary=true`);

  const events = Array.isArray(eventsData?.events)
    ? eventsData.events
    : Array.isArray(eventsData)
    ? eventsData
    : [];

  const bookings = Array.isArray(bookingsData?.bookings)
    ? bookingsData.bookings
    : [];

  const users = Array.isArray(usersData?.users)
    ? usersData.users
    : [];

  const confirmedBookings = bookings.filter(
    (b: any) => b?.status === "confirmed"
  );

  const totalRevenue = confirmedBookings.reduce(
    (sum: number, b: any) => sum + (Number(b?.totalAmount) || 0),
    0
  );

  // 📝 Map Recent Events
  const recentEvents = events.slice(0, 5).map((e: any) => ({
    id: e._id || Math.random().toString(),
    name: e.eventName || e.title || "Unnamed Event",
    host: e.hostName || e.host?.name || "Unknown Host",
    date: e.date ? new Date(e.date).toLocaleDateString() : "TBA",
    attendees: Number(e.attendeesCount) || 0,
  }));

  // 📝 Map Recent Transactions
  const recentTransactions = confirmedBookings.slice(0, 10).map((b: any) => ({
    id: b._id || Math.random().toString(),
    event: b.eventId?.eventName || b.eventTitle || "Event Payment",
    date: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recent",
    amount: `₹${Number(b.totalAmount || 0).toLocaleString()}`,
    status: "completed", // Filtered by 'confirmed' above
  }));

  // 🔒 ALWAYS 200 — NEVER throw
  return NextResponse.json({
    success: true,
    stats: {
      totalRevenue,
      totalEvents: events.length,
      totalUsers: users.length,
      totalTransactions: confirmedBookings.length,
    },
    recentEvents,
    recentTransactions,
    meta: {
      eventsOk: !!eventsData,
      bookingsOk: !!bookingsData,
      usersOk: !!usersData,
    },
  });
}
