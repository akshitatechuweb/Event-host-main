"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createCoupon, getAllEvents } from "@/lib/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Loader2,
  Calendar as CalendarIcon,
  Ticket,
  Tag,
  Info,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

interface AddCouponModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddCouponModal({ open, onClose }: AddCouponModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FLAT_AMOUNT",
    value: "",
    expiry_date: "",
    usage_limit: "",
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Global Coupon created successfully!");
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create coupon");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      type: "PERCENTAGE",
      value: "",
      expiry_date: "",
      usage_limit: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast.error("Please fill in required fields");
      return;
    }

    mutation.mutate({
      ...formData,
      value: Number(formData.value),
      usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      expiry_date: formData.expiry_date || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background/80 backdrop-blur-2xl border-border/40 max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 overflow-hidden">
        <div className="p-10 space-y-8">
          <DialogHeader>
            <div className="space-y-3">
              <div className="h-px w-12 bg-linear-to-r from-pink-500 to-violet-500" />
              <DialogTitle className="text-3xl font-semibold tracking-tight">
                Create New{" "}
                <span className="bg-linear-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                  Global Coupon
                </span>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground/60 font-medium text-base">
                This coupon will be applicable to{" "}
                <span className="text-foreground font-bold italic">
                  all events
                </span>{" "}
                on the platform.
              </DialogDescription>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-8 py-4">
            {/* Main Info */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="code"
                  className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
                >
                  Coupon Code
                </Label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                  <Input
                    id="code"
                    placeholder="e.g. UNREAL20"
                    className="pl-12 h-14 rounded-2xl bg-muted/10 border-border/30 focus:border-violet-500/50 uppercase font-semibold text-lg tracking-widest placeholder:text-muted-foreground/20"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="type"
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40"
                >
                  Discount Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(val: any) =>
                    setFormData({ ...formData, type: val })
                  }
                >
                  <SelectTrigger
                    id="type"
                    className="h-14 rounded-2xl bg-muted/10 border-border/30 font-medium"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/30 bg-background/95 backdrop-blur-xl">
                    <SelectItem value="PERCENTAGE" className="rounded-xl">
                      Percentage (%)
                    </SelectItem>
                    <SelectItem value="FLAT_AMOUNT" className="rounded-xl">
                      Flat Amount (₹)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="value"
                  className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
                >
                  Discount Value
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder={formData.type === "PERCENTAGE" ? "20" : "500"}
                  className="h-12 rounded-xl bg-input/20 border-border/30"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="expiry_date"
                  className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
                >
                  Expiry Date (Optional)
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                  <Input
                    id="expiry_date"
                    type="date"
                    className="pl-10 h-12 rounded-xl bg-input/20 border-border/30"
                    value={formData.expiry_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expiry_date: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="usage_limit"
                className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
              >
                Global Usage Limit
              </Label>
              <div className="relative">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                <Input
                  id="usage_limit"
                  type="number"
                  placeholder="Unlimited (e.g. 100)"
                  className="pl-10 h-12 rounded-xl bg-input/20 border-border/30"
                  value={formData.usage_limit}
                  onChange={(e) =>
                    setFormData({ ...formData, usage_limit: e.target.value })
                  }
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 italic px-2">
                Total number of times this coupon can be used across all events
                and users.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl font-bold uppercase tracking-wider"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl font-bold uppercase tracking-wider bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)] transition-all active:translate-y-0.5"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Global Coupon"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
