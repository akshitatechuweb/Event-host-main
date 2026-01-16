"use client";

import { Suspense, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CouponList } from "@/components/coupons/CouponList";
import { AddCouponModal } from "@/components/coupons/AddCouponModal";
import { getAllCoupons } from "@/lib/admin";
import { Loader2, Plus, Ticket, Search, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function CouponsContent() {
  const [openAdd, setOpenAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: coupons = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => getAllCoupons(),
  });

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="p-8 rounded-3xl border border-destructive/20 bg-destructive/5 text-center mt-20">
        <p className="text-sm text-destructive font-medium">
          {error instanceof Error ? error.message : "Failed to load coupons"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto px-10 py-14 space-y-12">
      {/* Header Section */}
      <header className="relative space-y-3 mb-14">
        <div className="absolute -top-28 -left-28 w-96 h-96 bg-pink-300/15 blur-[160px] rounded-full -z-10" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-indigo-300/15 blur-[160px] rounded-full -z-10" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <h1 className="text-[3.2rem] font-semibold tracking-tight bg-linear-to-r from-pink-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Coupons <span className="text-muted-foreground/20">&</span> Promos
            </h1>

            <p className="flex items-center gap-3 text-muted-foreground">
              <span className="h-px w-8 bg-linear-to-r from-pink-400 to-indigo-400" />
              Design and manage high-conversion discount offers for your events.
            </p>
          </div>

          <Button
            onClick={() => setOpenAdd(true)}
            className="h-14 px-8 rounded-2xl bg-linear-to-r from-pink-600 to-indigo-600 text-white font-semibold uppercase tracking-widest shadow-xl shadow-pink-500/10 hover:shadow-indigo-500/20 transition-all active:scale-95 group"
          >
            <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
            Create New Promo
          </Button>
        </div>
      </header>

      {/* Stats Quick View (Mock) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            label: "Active Promos",
            value: coupons.filter((c: any) => c.isActive).length,
            gradient: "from-pink-500/20 to-rose-500/20",
            iconColor: "text-pink-500",
          },
          {
            label: "Total Redemptions",
            value: coupons.reduce((s: number, c: any) => s + c.usageCount, 0),
            gradient: "from-violet-500/20 to-purple-500/20",
            iconColor: "text-violet-500",
          },
          {
            label: "Expiring Soon",
            value: "3",
            gradient: "from-amber-500/20 to-orange-500/20",
            iconColor: "text-amber-500",
          },
          {
            label: "Global Reach",
            value: "95%",
            gradient: "from-blue-500/20 to-indigo-500/20",
            iconColor: "text-blue-500",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="group relative p-6 rounded-4xl bg-card/40 border border-border/40 backdrop-blur-xl overflow-hidden transition-all hover:bg-card/60"
          >
            <div
              className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">
                {stat.label}
              </p>
              <p
                className={`text-3xl font-semibold tracking-tight ${stat.iconColor}`}
              >
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-violet-500 transition-colors" />
          <input
            placeholder="Search coupon by code or description..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card/30 border-border/40 focus:border-violet-500/50 text-base transition-all placeholder:text-muted-foreground/30 outline-hidden"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="h-14 px-8 rounded-2xl border-border/40 bg-card/30 hover:bg-muted/50 text-muted-foreground font-medium"
        >
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* List Section */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-sidebar-primary opacity-50" />
            <p className="text-muted-foreground font-medium animate-pulse">
              Syncing promo database...
            </p>
          </div>
        ) : (
          <CouponList coupons={filteredCoupons} />
        )}
      </div>

      {/* Create Modal */}
      <AddCouponModal open={openAdd} onClose={() => setOpenAdd(false)} />
    </div>
  );
}

export default function CouponsPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-20">
            <Loader2 className="h-10 w-10 animate-spin text-sidebar-primary" />
          </div>
        }
      >
        <CouponsContent />
      </Suspense>
    </DashboardLayout>
  );
}
