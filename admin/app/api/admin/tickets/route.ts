import { NextRequest, NextResponse } from "next/server";
import { adminBackendFetch, backendFetch, safeJson } from "@/lib/backend";

/**
 * GET /api/admin/tickets
 * Smart Proxy with fallback to legacy frontend aggregation.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");

  // 1. Try new backend route first
  try {
    const path = eventId ? `/tickets?eventId=${eventId}` : "/tickets";
    const response = await adminBackendFetch(path, req, { method: "GET" });
    
    // If backend returns 404, we fallback to legacy logic
    if (response.status === 404) {
      console.warn("⚠️ Backend /api/admin/tickets not found. Falling back to frontend aggregation.");
      return await handleFallbackAggregation(req, eventId);
    }

    const { ok, status, data, text } = await safeJson(response);
    if (!ok) {
      return NextResponse.json({ success: false, message: text || "Backend error" }, { status });
    }
    return NextResponse.json(data, { status });

  } catch (error) {
    console.error("❌ TICKETS PROXY ERROR:", error);
    // On connection error, try fallback too
    return await handleFallbackAggregation(req, eventId);
  }
}

/**
 * POST /api/admin/tickets
 */
export async function POST(req: NextRequest) {
  try {
    const response = await adminBackendFetch("/tickets", req, { method: "POST" });
    
    // Fallback if backend route is missing
    if (response.status === 404) {
      // Try legacy path: POST /api/passes/:eventId
      const body = await req.clone().json().catch(() => ({}));
      const eventId = body.eventId;
      if (eventId) {
        const legacyResponse = await backendFetch(`/api/passes/${eventId}`, req, {
          method: "POST",
          body: JSON.stringify(body),
        });
        return new NextResponse(legacyResponse.body, { 
            status: legacyResponse.status, 
            headers: legacyResponse.headers 
        });
      }
    }

    return new NextResponse(response.body, { status: response.status, headers: response.headers });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/tickets
 */
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const passId = searchParams.get("passId");
  const eventId = searchParams.get("eventId");

  try {
    const response = await adminBackendFetch(`/tickets/${passId}`, req, { method: "PUT" });
    
    if (response.status === 404 && eventId) {
      // Legacy path: PUT /api/passes/:eventId/:passId
      const legacyResponse = await backendFetch(`/api/passes/${eventId}/${passId}`, req, {
        method: "PUT",
        body: req.body,
        // @ts-ignore
        duplex: "half",
      });
      return new NextResponse(legacyResponse.body, { status: legacyResponse.status });
    }

    return new NextResponse(response.body, { status: response.status });
  } catch (error) {
      return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/tickets
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const passId = searchParams.get("passId");
  const eventId = searchParams.get("eventId");

  try {
    const response = await adminBackendFetch(`/tickets/${passId}`, req, { method: "DELETE" });
    
    if (response.status === 404 && eventId) {
      // Legacy path: DELETE /api/passes/:eventId/:passId
      const legacyResponse = await backendFetch(`/api/passes/${eventId}/${passId}`, req, {
        method: "DELETE",
      });
      return new NextResponse(legacyResponse.body, { status: legacyResponse.status });
    }

    return new NextResponse(response.body, { status: response.status });
  } catch (error) {
      return NextResponse.json({ success: false, message: "Internal Error" }, { status: 500 });
  }
}

/**
 * Legacy Fallback Aggregation Logic
 */
async function handleFallbackAggregation(req: NextRequest, filterEventId?: string | null) {
  try {
    const [eventsRes, bookingsRes] = await Promise.all([
      adminBackendFetch("/events", req),
      backendFetch("/api/booking/admin", req)
    ]);

    const eventsData = await eventsRes.json().catch(() => ({ events: [] }));
    const bookingsData = await bookingsRes.json().catch(() => ({ bookings: [] }));

    const events = eventsData.events || [];
    const bookings = (bookingsData.bookings || []).filter((b: any) => b.status === "confirmed");

    const allTickets: any[] = [];
    
    events.forEach((event: any) => {
      if (filterEventId && event._id !== filterEventId) return;

      const passes = event.passes || [];
      const eventBookings = bookings.filter((b: any) => (b.eventId?._id || b.eventId) === event._id);

      const soldByPassType: Record<string, number> = {};
      eventBookings.forEach((b: any) => {
        (b.items || []).forEach((item: any) => {
          soldByPassType[item.passType] = (soldByPassType[item.passType] || 0) + (item.quantity || 0);
        });
      });

      passes.forEach((pass: any) => {
        const sold = soldByPassType[pass.type] || 0;
        const total = pass.totalQuantity || 0;
        allTickets.push({
          _id: `${event._id}_${pass.type}`,
          eventId: event._id,
          eventName: event.eventName || event.title || "Unknown",
          ticketType: pass.type,
          price: pass.price || 0,
          total,
          sold,
          available: Math.max(0, total - sold),
        });
      });
    });

    return NextResponse.json({ success: true, tickets: allTickets });
  } catch (err) {
    console.error("Fallback failed:", err);
    return NextResponse.json({ success: false, message: "Aggregation Fallback Failed" }, { status: 500 });
  }
}