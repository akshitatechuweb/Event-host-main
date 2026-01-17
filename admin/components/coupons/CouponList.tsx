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
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      updateCouponStatus(id, is_active),
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
          Create your first global coupon to get started
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
            <Card className="relative overflow-hidden group border-border/40 bg-card/40 backdrop-blur-xl hover:border-violet-500/20 transition-all duration-300 rounded-4xl">
              {/* Status Indicator Bar */}
              <div
                className={`absolute top-0 left-0 w-1.5 h-full ${
                  coupon.is_active
                    ? "bg-linear-to-b from-pink-500 to-violet-500"
                    : "bg-muted-foreground/10"
                }`}
              />

              <div className="p-7 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-semibold tracking-tight text-foreground group-hover:text-violet-500 transition-colors">
                      {coupon.code}
                    </h3>
                    <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-[0.2em]">
                      {(coupon.type || "PERCENTAGE").replace("_", " ")}
                    </p>
                  </div>
                  <Badge
                    variant={coupon.is_active ? "default" : "secondary"}
                    className={
                      coupon.is_active
                        ? "bg-pink-500/10 text-pink-500 border-pink-500/20 font-medium"
                        : "font-medium"
                    }
                  >
                    {coupon.is_active ? "Active" : "Paused"}
                  </Badge>
                </div>

                {/* Value Display */}
                <div className="py-5 px-6 rounded-2xl bg-muted/10 border border-border/10 flex items-center justify-between group-hover:bg-muted/20 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-3xl font-semibold text-foreground tracking-tight">
                      {coupon.type === "PERCENTAGE"
                        ? `${coupon.value || 0}%`
                        : `₹${(coupon.value || 0).toLocaleString()}`}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/40 tracking-wider">
                      Discount
                    </span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-xl font-semibold text-foreground">
                      {coupon.usage_limit
                        ? `${coupon.usageCount}/${coupon.usage_limit}`
                        : coupon.usageCount}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/40 tracking-wider">
                      Redeemed
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 gap-5 text-[11px]">
                  <div className="flex items-center gap-2.5 text-muted-foreground/60">
                    <Calendar className="w-3.5 h-3.5 text-pink-500/50" />
                    <span>
                      {coupon.expiry_date
                        ? new Date(coupon.expiry_date).toLocaleDateString()
                        : "No Expiry"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground/60">
                    <Ticket className="w-3.5 h-3.5 text-indigo-500/50" />
                    <span>Applicable to all events</span>
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
                        is_active: !coupon.is_active,
                      })
                    }
                    disabled={toggleStatusMutation.isPending}
                  >
                    {coupon.is_active ? (
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
