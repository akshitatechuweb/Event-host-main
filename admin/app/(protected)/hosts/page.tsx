"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { HostsHeader } from "@/components/hosts/HostsHeader";
import { HostSearch } from "@/components/hosts/HostSearch";
import { HostTable } from "@/components/hosts/HostTable";
import { Host } from "@/types/host";
import { getHosts } from "@/lib/admin";

export default function HostsPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      const data = await getHosts();

      const normalized: Host[] = (data.requests ?? data).map(
        (item: {
          _id: string;
          userId?: { name?: string; phone?: string };
          city?: string;
          preferredPartyDate?: string;
          status?: Host["status"];
        }) => ({
        _id: item._id,
        userName: item.userId?.name ?? "Unknown",
        phone: item.userId?.phone ?? "-",
        city: item.city,
        preferredPartyDate: item.preferredPartyDate,
        status: item.status,
      }));

      setHosts(normalized);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error("Failed to load hosts");
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHosts();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-[1500px] mx-auto px-8 py-14 space-y-12">
        <HostsHeader />

        <section className="space-y-6">
          <HostSearch />

          {loading && <p>Loading hosts...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <HostTable hosts={hosts} onActionComplete={fetchHosts} />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
