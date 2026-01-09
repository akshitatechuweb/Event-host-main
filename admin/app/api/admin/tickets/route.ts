import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, backendFetch } from "@/lib/backend";

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
 * Admin: fetch all ticket/pass stats across events
 * Uses centralized backend helper to talk to /api/admin.
 */
export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";

    if (!cookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    /* =====================
       FETCH EVENTS (BACKEND)
       Uses correct route: GET /api/event/events
    ===================== */
    const eventsResponse = await backendFetch("/api/event/events", req, {
      method: "GET",
    });

    if (!eventsResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch events" },
        { status: eventsResponse.status }
      );
    }

    const eventsRaw = await eventsResponse.json();

    const events: EventWithPasses[] =
      typeof eventsRaw === "object" &&
        eventsRaw !== null &&
        "events" in eventsRaw &&
        Array.isArray((eventsRaw as any).events)
        ? (eventsRaw as any).events
        : [];

    /* =====================
       FETCH BOOKINGS (BACKEND)
    ===================== */
    let confirmedBookings: Booking[] = [];

    try {
      // Backend route: GET /api/booking/admin (all bookings)
      const bookingsResponse = await backendFetch("/api/booking/admin", req, {
        method: "GET",
      });

      if (bookingsResponse.ok) {
        const bookingsRaw = await bookingsResponse.json();

        if (
          typeof bookingsRaw === "object" &&
          bookingsRaw !== null &&
          Array.isArray((bookingsRaw as any).bookings)
        ) {
          confirmedBookings = (bookingsRaw as any).bookings.filter(
            (b: Booking) => b.status === "confirmed"
          );
        }
      }
    } catch (err) {
      console.error("⚠️ Booking fetch failed (non-fatal):", err);
    }

    /* =====================
       BUILD TICKETS
    ===================== */
    const allTickets: Ticket[] = [];

    events.forEach((event) => {
      const passes = event.passes ?? [];

      const eventBookings = confirmedBookings.filter((b) => {
        const bookingEventId =
          typeof b.eventId === "object" && b.eventId
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

        allTickets.push({
          _id: `${event._id}_${pass.type}`,
          eventId: event._id,
          eventName: event.eventName ?? event.title ?? "Unknown Event",
          ticketType: pass.type,
          price: Number(pass.price) || 0,
          total,
          sold,
          available: Math.max(0, total - sold),
        });
      });
    });

    return NextResponse.json({
      success: true,
      tickets: allTickets,
    });
  } catch (error) {
    console.error("❌ TICKETS API ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
