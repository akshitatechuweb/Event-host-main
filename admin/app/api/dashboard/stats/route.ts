import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Define types for better type safety
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
export async function GET(req: NextRequest) {
  try {
    // ✅ Extract accessToken cookie like other routes do
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken");

    if (!accessToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No access token" },
        { status: 401 }
      );
    }

    // ✅ Format cookie header correctly
    const cookieHeader = `accessToken=${accessToken.value}`;

    console.log("🍪 Access Token:", accessToken.value ? "Present" : "Missing");

    // ✅ Use admin endpoints
    const [eventsRes, bookingsRes, usersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/admin/events`, {
        headers: { Cookie: cookieHeader },
      }),
      fetch(`${API_BASE_URL}/api/booking/admin`, {
        headers: { Cookie: cookieHeader },
      }),
      fetch(`${API_BASE_URL}/api/user`, {
        headers: { Cookie: cookieHeader },
      }),
    ]);

    // Log responses for debugging
    console.log("📊 API Responses:");
    console.log("  Events status:", eventsRes.status);
    console.log("  Bookings status:", bookingsRes.status);
    console.log("  Users status:", usersRes.status);

    // Parse responses with error handling
    let events: Event[] = [];
    let bookings: Booking[] = [];
    let users: User[] = [];

    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      events = eventsData.events || eventsData || [];
      console.log("✅ Events fetched:", events.length);
      if (events.length > 0) {
        console.log("📋 Sample event:", {
          _id: events[0]._id,
          eventName: events[0].eventName,
          title: events[0].title,
          keys: Object.keys(events[0])
        });
      }
    } else {
      const errorText = await eventsRes.text();
      console.error("❌ Events error:", eventsRes.status, errorText);
    }

    if (bookingsRes.ok) {
      const bookingsData = await bookingsRes.json();
      bookings = bookingsData.bookings || bookingsData || [];
      console.log("✅ Bookings fetched:", bookings.length);
      if (bookings.length > 0) {
        console.log("📋 Sample booking:", {
          _id: bookings[0]._id,
          eventId: bookings[0].eventId,
          event: bookings[0].event,
          eventName: bookings[0].eventName,
          totalAmount: bookings[0].totalAmount,
          status: bookings[0].status,
          keys: Object.keys(bookings[0])
        });
      }
    } else {
      const errorText = await bookingsRes.text();
      console.error("❌ Bookings error:", bookingsRes.status, errorText);
    }

    if (usersRes.ok) {
      const usersData = await usersRes.json();
      console.log("🔍 Raw users data:", JSON.stringify(usersData).substring(0, 200));
      
      // 🔥 FIX: Handle different possible response structures
      if (Array.isArray(usersData)) {
        users = usersData;
      } else if (usersData.users && Array.isArray(usersData.users)) {
        users = usersData.users;
      } else if (usersData.data && Array.isArray(usersData.data)) {
        users = usersData.data;
      } else {
        console.warn("⚠️ Unexpected users data structure:", usersData);
        users = [];
      }
      
      console.log("✅ Users fetched:", users.length);
    } else {
      const errorText = await usersRes.text();
      console.error("❌ Users error:", usersRes.status, errorText);
    }

    // Calculate statistics
    const totalEvents = events.length;
    const totalUsers = users.length;
    
    // Calculate total revenue from confirmed bookings
    const confirmedBookings = bookings.filter(
      (b) => b.status === "confirmed"
    );
    const totalRevenue = confirmedBookings.reduce(
      (sum, booking) => sum + (booking.totalAmount || 0),
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
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      )
      .slice(0, 5)
      .map((event) => ({
        id: event._id,
        name: event.eventName || event.title || "Unknown Event",
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
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((booking) => {
        // 🔥 FIX: Extract the actual ID from the nested object
        let actualEventId = booking.eventId;
        
        // If eventId is an object with _id property, extract it
        if (actualEventId && typeof actualEventId === 'object' && '_id' in actualEventId) {
          actualEventId = actualEventId._id;
        }
        
        console.log("🔍 Looking for event:", {
          bookingId: booking._id,
          originalEventId: booking.eventId,
          extractedEventId: actualEventId,
          eventIdType: typeof actualEventId,
        });

        // Find the matching event
        const event = events.find((e) => {
          const eventIdStr = e._id?.toString() || e._id;
          const bookingEventIdStr = actualEventId?.toString() || actualEventId;
          
          return eventIdStr === bookingEventIdStr;
        });

        const timeAgo = getTimeAgo(new Date(booking.createdAt));
        
        const eventName = event?.eventName || event?.title || booking.eventName || booking.eventTitle || "Unknown Event";
        
        if (event) {
          console.log("✅ Event matched:", {
            bookingId: booking._id,
            eventId: actualEventId,
            eventName,
          });
        } else {
          console.warn("⚠️ No event found for booking:", {
            bookingId: booking._id,
            eventId: actualEventId,
          });
        }
        
        return {
          id: booking._id,
          event: eventName,
          amount: `₹${(booking.totalAmount || 0).toLocaleString("en-IN")}`,
          date: timeAgo,
          status: booking.status || "completed",
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
    console.error("❌ DASHBOARD STATS ERROR:", error);
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