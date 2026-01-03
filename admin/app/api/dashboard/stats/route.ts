import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}` : null;

// Domain types (unchanged)
interface Event {
  _id: string;
  eventName?: string;
  title?: string;
  hostedBy?: string;
  date: string;
  createdAt?: string;
  currentBookings?: number;
}

interface Booking {
  _id: string;
  eventId: string | { _id: string };
  eventName?: string;
  eventTitle?: string;
  event?: string;
  totalAmount?: number;
  status: string;
  createdAt: string;
}

interface User {
  _id: string;
  [key: string]: unknown;
}

/**
 * GET /api/dashboard/stats
 * Fetches dashboard statistics for admin
 */
export async function GET(_req: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { success: false, message: "API base URL not configured" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No access token" },
        { status: 401 }
      );
    }

    const cookieHeader = `accessToken=${accessToken}`;

    // Fetch all stats in parallel with error handling
    const [eventsRes, bookingsRes, usersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/events`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      }).catch((err) => {
        console.error("❌ Events fetch error:", err);
        return { ok: false, status: 500, statusText: "Internal Error", json: async () => ({}) } as Response;
      }),
      fetch(`${API_BASE_URL}/api/booking/admin`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      }).catch((err) => {
        console.error("❌ Bookings fetch error:", err);
        return { ok: false, status: 500, statusText: "Internal Error", json: async () => ({}) } as Response;
      }),
      fetch(`${API_BASE_URL}/api/user`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      }).catch((err) => {
        console.error("❌ Users fetch error:", err);
        return { ok: false, status: 500, statusText: "Internal Error", json: async () => ({}) } as Response;
      }),
    ]);

    // ---------- Events ----------
    let events: Event[] = [];
    if (eventsRes.ok) {
      try {
        const raw: unknown = await eventsRes.json();

      if (Array.isArray(raw)) {
        events = raw as Event[];
      } else if (
        typeof raw === "object" &&
        raw !== null &&
        "events" in raw &&
        Array.isArray((raw as { events?: unknown }).events)
      ) {
        events = (raw as { events: Event[] }).events;
      }
      } catch (err) {
        console.error("❌ Events JSON parse error:", err);
      }
    } else {
      const errorText = await eventsRes.text().catch(() => "Unknown error");
      console.error(`❌ Events API returned ${eventsRes.status}: ${eventsRes.statusText}`, errorText);
    }

    // ---------- Bookings ----------
    let bookings: Booking[] = [];
    if (bookingsRes.ok) {
      try {
        const raw: unknown = await bookingsRes.json();

      if (Array.isArray(raw)) {
        bookings = raw as Booking[];
      } else if (
        typeof raw === "object" &&
        raw !== null &&
        "bookings" in raw &&
        Array.isArray((raw as { bookings?: unknown }).bookings)
      ) {
        bookings = (raw as { bookings: Booking[] }).bookings;
      }
      } catch (err) {
        console.error("❌ Bookings JSON parse error:", err);
      }
    } else {
      const errorText = await bookingsRes.text().catch(() => "Unknown error");
      console.error(`❌ Bookings API returned ${bookingsRes.status}: ${bookingsRes.statusText}`, errorText);
    }

    // ---------- Users ----------
    let users: User[] = [];
    if (usersRes.ok) {
      try {
        const raw: unknown = await usersRes.json();

      if (Array.isArray(raw)) {
        users = raw;
      } else if (
        typeof raw === "object" &&
        raw !== null &&
        "users" in raw &&
        Array.isArray((raw as { users?: unknown }).users)
      ) {
        users = (raw as { users: User[] }).users;
      } else if (
        typeof raw === "object" &&
        raw !== null &&
        "data" in raw &&
        Array.isArray((raw as { data?: unknown }).data)
      ) {
        users = (raw as { data: User[] }).data;
      }
      } catch (err) {
        console.error("❌ Users JSON parse error:", err);
      }
    } else {
      const errorText = await usersRes.text().catch(() => "Unknown error");
      console.error(`❌ Users API returned ${usersRes.status}: ${usersRes.statusText}`, errorText);
    }

    // ---------- Stats ----------
    const confirmedBookings = bookings.filter(
      (b) => b.status === "confirmed"
    );

    const totalRevenue = confirmedBookings.reduce(
      (sum, b) => sum + (b.totalAmount ?? 0),
      0
    );

    const recentEvents = [...events]
      .sort(
        (a, b) =>
          new Date(b.createdAt ?? b.date).getTime() -
          new Date(a.createdAt ?? a.date).getTime()
      )
      .slice(0, 5)
      .map((event) => ({
        id: event._id,
        name: event.eventName ?? event.title ?? "Unknown Event",
        host: event.hostedBy ?? "Unknown",
        date: new Date(event.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        attendees: event.currentBookings ?? 0,
      }));

    const recentTransactions = confirmedBookings
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((booking) => {
        const eventId =
          typeof booking.eventId === "string"
            ? booking.eventId
            : booking.eventId?._id;

        const event = events.find((e) => e._id === eventId);

        return {
          id: booking._id,
          event:
            event?.eventName ??
            event?.title ??
            booking.eventName ??
            booking.eventTitle ??
            "Unknown Event",
          amount: `₹${(booking.totalAmount ?? 0).toLocaleString("en-IN")}`,
          date: getTimeAgo(new Date(booking.createdAt)),
          status: booking.status || "completed",
        };
      });

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
    });
  } catch (error: unknown) {
    console.error("❌ DASHBOARD STATS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
