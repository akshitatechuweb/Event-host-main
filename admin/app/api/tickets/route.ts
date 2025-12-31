import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Ticket {
  _id: string;
  eventId: string;
  eventName: string;
  ticketType: string;
  price: number; // numeric, UI adds currency symbol
  total: number;
  sold: number;
  available: number;
}

interface BookingItem {
  passType?: string;
  type?: string;
  quantity?: number | string;
}

interface Booking {
  status?: string;
  eventId?: string | { _id?: string };
  items?: BookingItem[];
}

interface EventPass {
  type: string;
  price?: number | string;
  totalQuantity?: number | string;
}

interface EventWithPasses {
  _id: string;
  eventName?: string;
  title?: string;
  passes?: EventPass[];
}

/**
 * GET /api/tickets
 * Fetches all passes (tickets) across all events for admin
 * Calculates sold tickets by counting actual bookings
 */
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all events (which includes passes)
    const eventsResponse = await fetch(`${API_BASE_URL}/api/event/events`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!eventsResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch events" },
        { status: eventsResponse.status }
      );
    }

    const eventsData = await eventsResponse.json();
    const events = (eventsData.events || []) as EventWithPasses[];

    // Fetch all bookings (admin endpoint)
    let allBookings: Booking[] = [];
    try {
      const bookingsResponse = await fetch(
        `${API_BASE_URL}/api/booking/admin`,
        {
          headers: {
            Cookie: cookieHeader,
          },
        }
      );

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        // Filter only confirmed bookings
        allBookings = (bookingsData.bookings || []).filter(
          (b: Booking) => b.status === "confirmed"
        );
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }

    // Transform passes from all events into ticket rows
    const allTickets: Ticket[] = [];
    
    events.forEach((event) => {
      const passes = event.passes || [];
      
      // Filter bookings for this event.
      // bookingController.getAllBookings() populates eventId, so it can be either
      // a plain ObjectId or a populated document. Normalize before comparing.
      const eventBookings = allBookings.filter((b) => {
        const bookingEventId =
          typeof b.eventId === "object" && b.eventId !== null
            ? b.eventId._id
            : b.eventId;
        return bookingEventId?.toString() === event._id?.toString();
      });
      
      // Calculate sold tickets per pass type from actual bookings
      const soldByPassType: Record<string, number> = {};
      
      eventBookings.forEach((booking) => {
        const items = booking.items || [];
        items.forEach((item) => {
          // Support both { passType } and legacy { type } shapes
          const passType = item.passType || item.type;
          const quantity = Number(item.quantity) || 0;

          if (passType && quantity > 0) {
            soldByPassType[passType] =
              (soldByPassType[passType] || 0) + quantity;
          }
        });
      });

      passes.forEach((pass) => {
        const sold = soldByPassType[pass.type] || 0;
        const total = Number(pass.totalQuantity) || 0;
        const available = Math.max(0, total - sold);

        allTickets.push({
          _id: `${event._id}_${pass.type}`,
          eventId: event._id,
          eventName: event.eventName || event.title,
          ticketType: pass.type,
          price: Number(pass.price) || 0, // numeric; UI handles currency symbol
          total,
          sold,
          available,
        });
      });
    });

    return NextResponse.json({
      success: true,
      tickets: allTickets,
    });
  } catch (error) {
    console.error("TICKETS API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
