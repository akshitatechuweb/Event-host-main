import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper function - moved to top to ensure it's in scope
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Define basic interfaces based on expected backend responses
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
  // add other fields if needed
}

/**
 * GET /api/dashboard/stats
 * Fetches dashboard statistics for admin
 */
export async function GET(req: NextRequest) {
  try {
    // Extract accessToken cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");

    if (!accessToken?.value) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No access token" },
        { status: 401 }
      );
    }

    const cookieHeader = `accessToken=${accessToken.value}`;

    console.log("🍪 Access Token: Present");

    // Fetch data from admin endpoints in parallel
    const [eventsRes, bookingsRes, usersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/events`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store", // optional: prevent caching sensitive admin data
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

    // Log statuses
    console.log("Events status:", eventsRes.status);
    console.log("Bookings status:", bookingsRes.status);
    console.log("Users status:", usersRes.status);

    // Parse responses safely
    const events: Event[] = eventsRes.ok
      ? ((await eventsRes.json()) as any).events ||
        ((await eventsRes.json()) as any) ||
        []
      : [];

    const bookings: Booking[] = bookingsRes.ok
      ? ((await bookingsRes.json()) as any).bookings ||
        ((await bookingsRes.json()) as any) ||
        []
      : [];

    const users: User[] = usersRes.ok
      ? ((await usersRes.json()) as any).users ||
        ((await usersRes.json()) as any) ||
        []
      : [];

    if (!eventsRes.ok) {
      const text = await eventsRes.text();
      console.error("Events fetch failed:", eventsRes.status, text);
    }
    if (!bookingsRes.ok) {
      const text = await bookingsRes.text();
      console.error("Bookings fetch failed:", bookingsRes.status, text);
    }
    if (!usersRes.ok) {
      const text = await usersRes.text();
      console.error("Users fetch failed:", usersRes.status, text);
    }

    // Calculate statistics
    const totalEvents = events.length;
    const totalUsers = users.length;

    const confirmedBookings = bookings.filter(
      (b) => b.status === "confirmed"
    );

    const totalRevenue = confirmedBookings.reduce(
      (sum, booking) => sum + (booking.totalAmount ?? 0),
      0
    );

    const totalTransactions = confirmedBookings.length;

    console.log("Stats calculated:", {
      totalEvents,
      totalUsers,
      totalRevenue,
      totalTransactions,
    });

    // Recent events (last 5)
    const recentEvents = events
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      )
      .slice(0, 5)
      .map((event) => ({
        id: event._id,
        name: event.eventName || event.title || "Untitled Event",
        host: event.hostedBy || "Unknown",
        date: new Date(event.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        attendees: event.currentBookings || 0,
      }));

    // Recent transactions (last 5 confirmed bookings)
    const recentTransactions = confirmedBookings
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((booking) => {
        const event = events.find(
          (e) => e._id === booking.eventId
        );

        return {
          id: booking._id,
          event: event?.eventName || event?.title || "Unknown Event",
          amount: `₹${(booking.totalAmount ?? 0).toLocaleString("en-IN")}`,
          date: getTimeAgo(new Date(booking.createdAt)),
          status: booking.status,
        };
      });

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        totalEvents,
        totalUsers,
        totalTransactions,
      },
      recentEvents,
      recentTransactions,
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}