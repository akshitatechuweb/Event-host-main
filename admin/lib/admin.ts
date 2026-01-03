// ===========================
// Hosts
// ===========================
export async function getHosts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/hosts?action=list`,
    { credentials: "include" }
  );

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
// Event Transactions
// ===========================
export async function getEventTransactions(eventId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${eventId}/transactions`,
    { credentials: "include" }
  );

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch event transactions");
  }

  return res.json();
}

// ===========================
// Approved Hosts
// ===========================
export async function getApprovedHosts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/hosts`,
    { credentials: "include" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch approved hosts");
  }

  return res.json();
}

export async function approveHost(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/hosts?action=approve&id=${id}`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to approve host");
  }

  return res.json();
}

export async function rejectHost(id: string, reason?: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/hosts?action=reject&id=${id}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reason }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to reject host");
  }

  return res.json();
}

// ===========================
// Tickets
// ===========================
export async function getAllTickets() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets`,
    { credentials: "include" }
  );

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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/stats`,
    { credentials: "include" }
  );

  if (res.status === 401) {
    return { __unauthorized: true };
  }

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  return res.json();
}

