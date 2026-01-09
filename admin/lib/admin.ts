import type { EventTransactionsResponse } from "@/types/transaction";
import type { Transaction } from "@/types/transaction";
import { clientFetch } from "./client";

// ===========================
// Hosts
// ===========================
export async function getHosts() {
  const res = await fetch(`/api/admin/hosts?action=list`, {
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch hosts");
  }

  return res.json();
}

// ===========================
// Event Transactions (SINGLE SOURCE OF TRUTH)
// ===========================
export async function getEventTransactions(
  eventId: string
): Promise<EventTransactionsResponse> {
  const res = await fetch(`/api/admin/transactions?eventId=${eventId}`, {
    credentials: "include",
    cache: "no-store",
  });

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

  // 🔥 IMPORTANT: recompute totals SAFELY on frontend
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
// Approved Hosts
// ===========================
export async function getApprovedHosts() {
  const res = await fetch(`/api/admin/hosts`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch approved hosts");
  }

  return res.json();
}

export async function approveHost(id: string) {
  const res = await fetch(`/api/admin/hosts?action=approve&id=${id}`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to approve host");
  }

  return res.json();
}

export async function rejectHost(id: string, reason?: string) {
  const res = await fetch(`/api/admin/hosts?action=reject&id=${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ reason }),
  });

  if (!res.ok) {
    throw new Error("Failed to reject host");
  }

  return res.json();
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
export async function getAllEvents() {
  const res = await fetch("/api/admin/events", {
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
