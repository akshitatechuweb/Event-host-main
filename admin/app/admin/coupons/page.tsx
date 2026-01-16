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
    <div className="max-w-[1500px] mx-auto px-8 py-14 space-y-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sidebar-primary/10 text-sidebar-primary text-xs font-black uppercase tracking-wider mb-2">
            <Ticket className="w-3 h-3" /> Promotion Engine
          </div>
          <h1 className="text-5xl font-black tracking-tight text-foreground">
            Coupons <span className="text-sidebar-primary">&</span> Promos
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Design and manage high-conversion discount offers for your global
            event attendees.
          </p>
        </div>

        <Button
          onClick={() => setOpenAdd(true)}
          className="h-14 px-8 rounded-2xl bg-sidebar-primary text-white font-black uppercase tracking-widest shadow-xl shadow-sidebar-primary/20 hover:bg-sidebar-primary/90 transition-all active:scale-95 group"
        >
          <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
          Create New Promo
        </Button>
      </div>

      {/* Stats Quick View (Mock) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Active Promos",
            value: coupons.filter((c) => c.isActive).length,
            color: "text-green-500",
          },
          {
            label: "Total Redemptions",
            value: coupons.reduce((s, c) => s + c.usageCount, 0),
            color: "text-sidebar-primary",
          },
          { label: "Expiring Soon", value: "3", color: "text-amber-500" },
          { label: "Global Reach", value: "95%", color: "text-blue-500" },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-card/40 border border-border/40 backdrop-blur-sm"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">
              {stat.label}
            </p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-sidebar-primary transition-colors" />
          <Input
            placeholder="Search coupon by code or description..."
            className="h-14 pl-12 rounded-2xl bg-card border-border/40 focus:border-sidebar-primary/50 text-lg transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="h-14 px-6 rounded-2xl border-border/40 bg-card hover:bg-muted/50"
        >
          <Filter className="w-5 h-5 mr-2" />
          Advanced Filters
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
