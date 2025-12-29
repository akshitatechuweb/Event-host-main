// admin/lib/admin.ts

export async function getHosts() {
  const res = await fetch("/api/hosts?action=list", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch hosts");
  }

  return res.json();
}

// Get transactions for an event (admin)
export async function getEventTransactions(eventId: string) {
  const res = await fetch(
    `/api/admin/events/${eventId}/transactions`,
    {
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch event transactions");
  }

  return res.json();
}


// Fetch approved hosts (for assigning events)
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