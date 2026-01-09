import type { EventTransactionsResponse } from "@/types/transaction";
import type { Transaction } from "@/types/transaction";
import { clientFetch } from "./client";

/* ===========================
   HOST REQUESTS
=========================== */

// 🔹 Get all host requests
export async function getHosts() {
  const res = await fetch(`/api/admin/host-requests`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch host requests");
  }

  return res.json();
}

// 🔹 Get single host request
export async function getHostById(id: string) {
  const res = await fetch(`/api/admin/host-requests?id=${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch host request");
  }

  return res.json();
}

// 🔹 Approve host
export async function approveHost(id: string) {
  const res = await fetch(`/api/admin/approve-event-request/${id}`, {
    method: "PUT",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to approve host");
  }

  return res.json();
}

// 🔹 Reject host
export async function rejectHost(id: string, reason?: string) {
  const res = await fetch(`/api/admin/host-requests`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, reason }),
  });

  if (!res.ok) {
    throw new Error("Failed to reject host");
  }

  return res.json();
}

/* ===========================
   EVENT TRANSACTIONS
   (Single source of truth)
=========================== */

export async function getEventTransactions(
  eventId: string
): Promise<EventTransactionsResponse> {
  const res = await fetch(
    `/api/admin/events/${eventId}/transactions`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  const raw: EventTransactionsResponse = await res.json();

  console.log("API /transactions raw response:", raw);

  if (!res.ok || !raw?.success) {
    throw new Error(raw?.message || "Failed to fetch transactions");
  }

  const transactions: Transaction[] = raw.transactions.map((t) => ({
    _id: t._id,
    amount: t.amount,
    platformFee: t.platformFee,
    payoutToHost: t.payoutToHost,
    providerTxnId: t.providerTxnId,
    status: t.status,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    booking: t.booking ?? null,
  }));

  // 🔥 recompute totals safely
  const totals = {
    totalRevenue: transactions.reduce((sum, t) => sum + Number(t.amount), 0),
    totalTransactions: transactions.length,
    totalTickets: transactions.reduce(
      (sum, t) => sum + (t.booking?.ticketCount ?? 0),
      0
    ),
  };

  return {
    success: true,
    transactions,
    totals,
  };
}

// ===========================
// Tickets
// ===========================
export async function getAllTickets() {
  const res = await fetch(`/api/admin/tickets`, {
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch tickets");
  }

  return res.json();
}

export async function getDashboardStats() {
  try {
    const res = await clientFetch("/admin/dashboard/stats");
    return await res.json();
  } catch {
    return {
      success: true,
      stats: {
        totalRevenue: 0,
        totalEvents: 0,
        totalUsers: 0,
        totalTransactions: 0,
      },
    };
  }
}

// Events (for Transactions page)
// ===========================
// ===========================
// Events (for Transactions page)
// ===========================
export async function getAllEvents() {
  const res = await fetch("/api/event/events", {
    credentials: "include",
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return {
      success: false,
      events: [],
    };
  }

  return data;
}

// ===========================
// Pass Management (New)
// ===========================
export async function createPass(eventId: string, data: any) {
  const res = await fetch(`/api/passes/${eventId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create pass");
  }

  return res.json();
}


