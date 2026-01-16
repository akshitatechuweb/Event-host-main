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
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FLAT_AMOUNT",
    discountValue: "",
    description: "",
    minOrderAmount: "",
    maxDiscount: "",
    expiryDate: "",
    usageLimit: "",
    perUserLimit: "1",
    applicableEvents: [] as string[],
  });

  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["events-all"],
    queryFn: () => getAllEvents(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon created successfully!");
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
      discountType: "PERCENTAGE",
      discountValue: "",
      description: "",
      minOrderAmount: "",
      maxDiscount: "",
      expiryDate: "",
      usageLimit: "",
      perUserLimit: "1",
      applicableEvents: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      toast.error("Please fill in required fields");
      return;
    }

    mutation.mutate({
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      perUserLimit: Number(formData.perUserLimit) || 1,
      expiryDate: formData.expiryDate || null,
    });
  };

  const toggleEvent = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableEvents: prev.applicableEvents.includes(eventId)
        ? prev.applicableEvents.filter((id) => id !== eventId)
        : [...prev.applicableEvents, eventId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-background/80 backdrop-blur-2xl border-border/40 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-sidebar-primary/10 text-sidebar-primary">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                Create New Coupon
              </DialogTitle>
              <DialogDescription>
                Design a new discount promo for your users
              </DialogDescription>
            </div>
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
                <Tag className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="code"
                  placeholder="e.g. UNREAL20"
                  className="pl-10 h-12 rounded-xl bg-input/20 border-border/30 focus:border-sidebar-primary uppercase font-bold text-lg tracking-widest"
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

            <div className="space-y-2">
              <Label
                htmlFor="discountType"
                className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
              >
                Discount Type
              </Label>
              <Select
                value={formData.discountType}
                onValueChange={(val: any) =>
                  setFormData({ ...formData, discountType: val })
                }
              >
                <SelectTrigger
                  id="discountType"
                  className="h-12 rounded-xl bg-input/20 border-border/30"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/30 bg-background/95 backdrop-blur-lg">
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FLAT_AMOUNT">Flat Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="discountValue"
                className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
              >
                Discount Value
              </Label>
              <Input
                id="discountValue"
                type="number"
                placeholder={
                  formData.discountType === "PERCENTAGE" ? "20" : "500"
                }
                className="h-12 rounded-xl bg-input/20 border-border/30"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="expiryDate"
                className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
              >
                Expiry Date (Optional)
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                <Input
                  id="expiryDate"
                  type="date"
                  className="pl-10 h-12 rounded-xl bg-input/20 border-border/30"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-xs uppercase tracking-widest font-bold text-muted-foreground"
            >
              Description (Publicly Visible)
            </Label>
            <div className="relative">
              <Info className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
              <Textarea
                id="description"
                placeholder="e.g. Get 20% off on your next event booking!"
                className="pl-10 min-h-[80px] rounded-xl bg-input/20 border-border/30"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          {/* Limits & Constraints */}
          <div className="p-6 rounded-2xl bg-muted/20 border border-border/20 space-y-6">
            <h4 className="text-xs uppercase tracking-widest font-black text-muted-foreground/60 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Usage & Constraints
            </h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="minOrderAmount"
                  className="text-sm font-semibold"
                >
                  Min Order (₹)
                </Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  placeholder="0"
                  className="rounded-xl bg-background/50 border-border/30"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minOrderAmount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDiscount" className="text-sm font-semibold">
                  Max Discount Cap (₹)
                </Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  placeholder="No limit"
                  className="rounded-xl bg-background/50 border-border/30"
                  value={formData.maxDiscount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDiscount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usageLimit" className="text-sm font-semibold">
                  Global Usage Limit
                </Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="Unlimited"
                  className="rounded-xl bg-background/50 border-border/30"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perUserLimit" className="text-sm font-semibold">
                  Per User Limit
                </Label>
                <Input
                  id="perUserLimit"
                  type="number"
                  placeholder="1"
                  className="rounded-xl bg-background/50 border-border/30"
                  value={formData.perUserLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, perUserLimit: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Event Targeting */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
                Target Specific Events (Optional)
              </Label>
              <span className="text-[10px] bg-sidebar-primary/10 text-sidebar-primary px-2 py-0.5 rounded-full font-bold">
                {formData.applicableEvents.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto p-4 rounded-2xl bg-muted/10 border border-border/20 custom-scrollbar">
              {isEventsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-sidebar-primary" />
                </div>
              ) : (events?.events || []).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No events found to track
                </p>
              ) : (
                (events?.events || []).map((event: any) => (
                  <label
                    key={event._id}
                    className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors border border-transparent hover:border-border/30"
                  >
                    <Checkbox
                      checked={formData.applicableEvents.includes(event._id)}
                      onCheckedChange={() => toggleEvent(event._id)}
                      className="rounded-md border-border/40"
                    />
                    <span className="text-sm font-medium text-foreground line-clamp-1">
                      {event.eventName}
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="text-[10px] text-muted-foreground/60 italic">
              If no events are selected, the coupon will be global.
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
              className="flex-1 h-12 rounded-xl font-bold uppercase tracking-wider bg-sidebar-primary text-white hover:bg-sidebar-primary/90 shadow-lg shadow-sidebar-primary/20"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                "Create Coupon"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
