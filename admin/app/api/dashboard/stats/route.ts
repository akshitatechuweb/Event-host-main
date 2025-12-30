import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/stats
 * Fetches dashboard statistics for admin
 * Uses existing Next.js API routes which handle auth properly
 */
export async function GET(req: NextRequest) {
  try {
    // Get the base URL for internal API calls
    const baseUrl = req.nextUrl.origin; // e.g., http://localhost:3000
    const cookieHeader = req.headers.get("cookie") || "";

    // ✅ Use existing Next.js API routes instead of calling backend directly
    const [eventsRes, bookingsRes, usersRes] = await Promise.all([
      fetch(`${baseUrl}/api/events`, {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/booking/admin`, {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/user`, {
        headers: {
          cookie: cookieHeader,
        },
        cache: "no-store",
      }),
    ]);

    // Log responses for debugging
    console.log("📊 API Responses:");
    console.log("  Events status:", eventsRes.status);
    console.log("  Bookings status:", bookingsRes.status);
    console.log("  Users status:", usersRes.status);

    // Parse responses with error handling
    let events: any[] = [];
    let bookings: any[] = [];
    let users: any[] = [];

    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      events = eventsData.events || eventsData || [];
      console.log("✅ Events fetched:", events.length);
    } else {
      const errorText = await eventsRes.text();
      console.error("❌ Events error:", eventsRes.status, errorText.substring(0, 200));
    }

    if (bookingsRes.ok) {
      const bookingsData = await bookingsRes.json();
      bookings = bookingsData.bookings || bookingsData || [];
      console.log("✅ Bookings fetched:", bookings.length);
    } else {
      const errorText = await bookingsRes.text();
      console.error("❌ Bookings error:", bookingsRes.status, errorText.substring(0, 200));
    }

    if (usersRes.ok) {
      const usersData = await usersRes.json();
      users = usersData.users || usersData || [];
      console.log("✅ Users fetched:", users.length);
    } else {
      const errorText = await usersRes.text();
      console.error("❌ Users error:", usersRes.status, errorText.substring(0, 200));
    }

    // Calculate statistics
    const totalEvents = events.length;
    const totalUsers = users.length;
    
    // Calculate total revenue from confirmed bookings
    const confirmedBookings = bookings.filter(
      (b: any) => b.status === "confirmed"
    );
    const totalRevenue = confirmedBookings.reduce(
      (sum: number, booking: any) => sum + (booking.totalAmount || 0),
      0
    );

    // Calculate total transactions
    const totalTransactions = confirmedBookings.length;

    console.log("📈 Stats calculated:", {
      totalEvents,
      totalUsers,
      totalRevenue,
      totalTransactions,
    });

    // Get recent events (last 5)
    const recentEvents = events
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      )
      .slice(0, 5)
      .map((event: any) => ({
        id: event._id,
        name: event.eventName || event.title,
        host: event.hostedBy || "Unknown",
        date: new Date(event.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        attendees: event.currentBookings || 0,
      }));

    // Get recent transactions (last 5)
    const recentTransactions = confirmedBookings
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((booking: any) => {
        const event = events.find(
          (e: any) => e._id?.toString() === booking.eventId?.toString()
        );
        const timeAgo = getTimeAgo(new Date(booking.createdAt));
        
        return {
          id: booking._id,
          event: event?.eventName || "Unknown Event",
          amount: `₹${(booking.totalAmount || 0).toLocaleString("en-IN")}`,
          date: timeAgo,
          status: booking.status || "completed",
        };
      });

    // ✅ IMPORTANT: Return the correct structure with stats object
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
  });
}