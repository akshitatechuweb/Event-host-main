"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCouponStatus, deleteCoupon } from "@/lib/admin";
import { Coupon } from "@/types/coupon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Calendar,
  Users,
  Ticket,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CouponListProps {
  coupons: Coupon[];
}

export function CouponList({ coupons }: CouponListProps) {
  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCouponStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon status updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete coupon");
    },
  });

  if (coupons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 rounded-3xl border border-dashed border-border/50 bg-muted/5">
        <Ticket className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium text-lg">
          No coupons found
        </p>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Create your first coupon to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {coupons.map((coupon) => (
          <motion.div
            key={coupon._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
          >
            <Card className="relative overflow-hidden group border-border/40 bg-card/50 backdrop-blur-xl hover:border-sidebar-primary/30 transition-all duration-300">
              {/* Status Indicator Bar */}
              <div
                className={`absolute top-0 left-0 w-1 h-full ${
                  coupon.isActive ? "bg-green-500" : "bg-muted-foreground/30"
                }`}
              />

              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tighter text-foreground group-hover:text-sidebar-primary transition-colors">
                      {coupon.code}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                      {coupon.discountType.replace("_", " ")}
                    </p>
                  </div>
                  <Badge
                    variant={coupon.isActive ? "default" : "secondary"}
                    className={
                      coupon.isActive
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : ""
                    }
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Description */}
                {coupon.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {coupon.description}
                  </p>
                )}

                {/* Value Display */}
                <div className="py-4 px-5 rounded-2xl bg-muted/20 border border-border/20 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-foreground">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                      Discount Value
                    </span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {coupon.usageLimit
                        ? `${coupon.usageCount}/${coupon.usageLimit}`
                        : coupon.usageCount}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                      Used
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {coupon.expiryDate
                        ? new Date(coupon.expiryDate).toLocaleDateString()
                        : "No Expiry"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{coupon.perUserLimit} per user</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Ticket className="w-3.5 h-3.5" />
                    <span>
                      {coupon.applicableEvents.length > 0
                        ? `${coupon.applicableEvents.length} Events Restricted`
                        : "Global Coupon"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl h-9 font-bold text-xs uppercase tracking-wider"
                    onClick={() =>
                      toggleStatusMutation.mutate({
                        id: coupon._id,
                        isActive: !coupon.isActive,
                      })
                    }
                    disabled={toggleStatusMutation.isPending}
                  >
                    {coupon.isActive ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 mr-2" /> Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Activate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this coupon?")
                      ) {
                        deleteMutation.mutate(coupon._id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
