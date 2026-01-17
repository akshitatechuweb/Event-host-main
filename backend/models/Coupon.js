import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["PERCENTAGE", "FLAT_AMOUNT"],
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    usage_limit: {
      type: Number,
      default: null,
    },
    expiry_date: {
      type: Date,
      default: null,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Index for fast lookup by code
couponSchema.index({ code: 1 });

export default mongoose.model("Coupon", couponSchema);
