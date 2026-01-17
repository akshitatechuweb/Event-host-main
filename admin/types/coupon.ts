export type DiscountType = "PERCENTAGE" | "FLAT_AMOUNT";

export interface Coupon {
  _id: string;
  code: string;
  type: DiscountType;
  value: number;
  usage_limit: number | null;
  expiry_date: string | null;
  usageCount: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponInput {
  code: string;
  type: DiscountType;
  value: number;
  usage_limit?: number | null;
  expiry_date?: string | null;
}
