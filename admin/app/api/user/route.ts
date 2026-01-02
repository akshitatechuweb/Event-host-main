import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? null;

// Helper
function getTimeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Domain types
interface Event {
  _id: string;
  eventName?: string;
  title?: string;
  hostedBy?: string;
  date: string | Date;
  createdAt?: string | Date;
  currentBookings?: number;
}

interface Booking {
  _id: string;
  eventId: string;
  totalAmount?: number;
  status: string;
  createdAt: string | Date;
}

interface User {
  _id: string;
}

/**
 * GET /api/dashboard/stats
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
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const cookieHeader = `accessToken=${accessToken}`;

    const [eventsRes, bookingsRes, usersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/events`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      }),
      fetch(`${API_BASE_URL}/api/booking/admin`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      }),
      fetch(`${API_BASE_URL}/api/user`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      }),
    ]);

    /* ---------- EVENTS ---------- */
    let events: Event[] = [];
    if (eventsRes.ok) {
      const raw: unknown = await eventsRes.json();
      if (
        typeof raw === "object" &&
        raw !== null &&
        "events" in raw &&
        Array.isArray((raw as { events?: unknown }).events)
      ) {
        events = (raw as { events: Event[] }).events;
      }
    }

    /* ---------- BOOKINGS ---------- */
    let bookings: Booking[] = [];
    if (bookingsRes.ok) {
      const raw: unknown = await bookingsRes.json();
      if (
        typeof raw === "object" &&
        raw !== null &&
        "bookings" in raw &&
        Array.isArray((raw as { bookings?: unknown }).bookings)
      ) {
        bookings = (raw as { bookings: Booking[] }).bookings;
      }
    }

    /* ---------- USERS ---------- */
    let users: User[] = [];
    if (usersRes.ok) {
      const raw: unknown = await usersRes.json();
      if (
        typeof raw === "object" &&
        raw !== null &&
        "users" in raw &&
        Array.isArray((raw as { users?: unknown }).users)
      ) {
        users = (raw as { users: User[] }).users;
      }
    }

    /* ---------- STATS ---------- */
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
        name: event.eventName ?? event.title ?? "Untitled Event",
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
        const event = events.find((e) => e._id === booking.eventId);

        return {
          id: booking._id,
          event: event?.eventName ?? event?.title ?? "Unknown Event",
          amount: `₹${(booking.totalAmount ?? 0).toLocaleString("en-IN")}`,
          date: getTimeAgo(new Date(booking.createdAt)),
          status: booking.status,
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
    console.error("DASHBOARD STATS ERROR:", error);

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
