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

  // 🔒 ALWAYS 200 — NEVER throw
  return NextResponse.json({
    success: true,
    stats: {
      totalRevenue,
      totalEvents: events.length,
      totalUsers: users.length,
      totalTransactions: confirmedBookings.length,
    },
    meta: {
      eventsOk: !!eventsData,
      bookingsOk: !!bookingsData,
      usersOk: !!usersData,
    },
  });
}
