import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ? `${process.env.NEXT_PUBLIC_API_BASE_URL}` : null;

interface Ticket {
  _id: string;
  eventId: string;
  eventName: string;
  ticketType: string;
  price: number;
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
 */
export async function GET(req: NextRequest) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { success: false, message: "API base URL not configured" },
        { status: 500 }
      );
    }

    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    /* =====================
       FETCH EVENTS
    ===================== */
    const eventsResponse = await fetch(
      `${API_BASE_URL}/api/event/events`,
      {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      }
    );

    if (!eventsResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch events" },
        { status: eventsResponse.status }
      );
    }

    const eventsRaw: unknown = await eventsResponse.json();

    const events: EventWithPasses[] =
      typeof eventsRaw === "object" &&
      eventsRaw !== null &&
      "events" in eventsRaw &&
      Array.isArray((eventsRaw as { events?: unknown }).events)
        ? ((eventsRaw as { events: unknown[] }).events as EventWithPasses[])
        : [];

    /* =====================
       FETCH BOOKINGS
    ===================== */
    let allBookings: Booking[] = [];

    try {
      const bookingsResponse = await fetch(
        `${API_BASE_URL}/api/booking/admin`,
        {
          headers: { Cookie: cookieHeader },
          cache: "no-store",
        }
      );

      if (bookingsResponse.ok) {
        const bookingsRaw: unknown = await bookingsResponse.json();

        if (
          typeof bookingsRaw === "object" &&
          bookingsRaw !== null &&
          "bookings" in bookingsRaw &&
          Array.isArray((bookingsRaw as { bookings?: unknown }).bookings)
        ) {
          allBookings = (bookingsRaw as {
            bookings: Booking[];
          }).bookings.filter((b) => b.status === "confirmed");
        }
      }
    } catch (error: unknown) {
      console.error("Error fetching bookings:", error);
    }

    /* =====================
       BUILD TICKETS
    ===================== */
    const allTickets: Ticket[] = [];

    events.forEach((event) => {
      const passes = event.passes ?? [];

      const eventBookings = allBookings.filter((b) => {
        const bookingEventId =
          typeof b.eventId === "object" && b.eventId !== null
            ? b.eventId._id
            : b.eventId;

        return bookingEventId?.toString() === event._id.toString();
      });

      const soldByPassType: Record<string, number> = {};

      eventBookings.forEach((booking) => {
        (booking.items ?? []).forEach((item) => {
          const passType = item.passType ?? item.type;
          const quantity = Number(item.quantity) || 0;

          if (passType && quantity > 0) {
            soldByPassType[passType] =
              (soldByPassType[passType] || 0) + quantity;
          }
        });
      });

      passes.forEach((pass) => {
        const sold = soldByPassType[pass.type] ?? 0;
        const total = Number(pass.totalQuantity) || 0;
        const available = Math.max(0, total - sold);

        allTickets.push({
          _id: `${event._id}_${pass.type}`,
          eventId: event._id,
          eventName: event.eventName ?? event.title ?? "Unknown Event",
          ticketType: pass.type,
          price: Number(pass.price) || 0,
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
  } catch (error: unknown) {
    console.error("TICKETS API ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
