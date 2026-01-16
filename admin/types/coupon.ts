export type DiscountType = "PERCENTAGE" | "FLAT_AMOUNT";

export interface Coupon {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  description?: string;
  applicableEvents: {
    _id: string;
    title: string;
  }[];
  minOrderAmount: number;
  maxDiscount: number | null;
  expiryDate: string | null;
  usageLimit: number | null;
  perUserLimit: number;
  usageCount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  description?: string;
  applicableEvents?: string[];
  minOrderAmount?: number;
  maxDiscount?: number | null;
  expiryDate?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number;
}
