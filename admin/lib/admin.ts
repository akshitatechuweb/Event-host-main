// ===========================
// Hosts
// ===========================
export async function getHosts() {
  const res = await fetch(`/api/hosts?action=list`, {
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
export async function getEventTransactions(eventId: string) {
  const res = await fetch(
    `/api/transactions?eventId=${eventId}`,
    {
      credentials: "include",
      cache: "no-store",
    }
  )

  const text = await res.text()

  try {
    return JSON.parse(text)
  } catch {
    throw new Error("Invalid server response")
  }
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
  const res = await fetch(`/api/hosts?action=approve&id=${id}`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to approve host");
  }

  return res.json();
}

export async function rejectHost(id: string, reason?: string) {
  const res = await fetch(`/api/hosts?action=reject&id=${id}`, {
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
  const res = await fetch(`/api/tickets`, {
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

// ===========================
// Dashboard Stats
// ===========================
export async function getDashboardStats() {
  try {
    const res = await fetch("/api/dashboard/stats", {
      credentials: "include",
      cache: "no-store",
    });

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


// ===========================
// Events (for Transactions page)
// ===========================
export async function getAllEvents() {
  const res = await fetch("/api/events", {
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

