"use client";

import { Suspense, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { HostsHeader } from "@/components/hosts/HostsHeader";
import { HostSearch } from "@/components/hosts/HostSearch";
import { HostTable } from "@/components/hosts/HostTable";
import { Host } from "@/types/host";
import { getHosts } from "@/lib/admin";
import { filterBySearchQuery } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { Loader2 } from "lucide-react";

/**
 * Minimal backend shape used ONLY for normalization.
 */
type RawHost = {
  _id: string;
  userId?: {
    name?: string;
    phone?: string;
  };
  city?: string;
  preferredPartyDate?: string;
  status?: Host["status"];
};

function HostsContent() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const debouncedQuery = useDebouncedValue(searchQuery, 250);

  const { data, isLoading, error } = useQuery({
    queryKey: ["hosts", page, limit],
    queryFn: () => getHosts(page, limit),
  });

  const source = data?.requests ?? [];
  const meta = data?.meta;

  const normalized: Host[] = useMemo(() => 
    source.map((item: RawHost) => ({
      _id: item._id,
      userName: item.userId?.name ?? "Unknown",
      phone: item.userId?.phone ?? "-",
      city: item.city ?? "—",
      preferredPartyDate: item.preferredPartyDate ?? "—",
      status: item.status,
    })), [source]
  );

  const filteredHosts = useMemo(
    () =>
      filterBySearchQuery(normalized, debouncedQuery, (host) => [
        host.userName,
        host.phone,
        host.city,
      ]),
    [normalized, debouncedQuery],
  );

  return (
    <div className="max-w-[1500px] mx-auto px-8 py-14 space-y-12">
      <HostsHeader />

      <section className="space-y-8">
        <HostSearch value={searchQuery} onChange={setSearchQuery} />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 rounded-3xl border border-border/50 bg-muted/10 glass-morphism">
            <Loader2 className="w-10 h-10 animate-spin text-sidebar-primary mb-4" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Syncing host requests...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl border border-destructive/20 bg-destructive/5 text-center">
            <p className="text-sm text-destructive font-medium">Failed to load hosts</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden glass-morphism">
            <HostTable
              hosts={filteredHosts}
              onActionComplete={() => queryClient.invalidateQueries({ queryKey: ["hosts"] })}
            />
            {meta && meta.totalPages > 1 && (
              <div className="border-t border-border/50 bg-muted/5">
                <Pagination 
                  currentPage={meta.currentPage} 
                  totalPages={meta.totalPages} 
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default function HostsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary" />
        </div>
      }>
        <HostsContent />
      </Suspense>
    </DashboardLayout>
  );
}
