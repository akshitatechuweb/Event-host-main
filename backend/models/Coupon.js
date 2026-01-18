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
  },
  { timestamps: true },
);

// Index for fast lookup by code
couponSchema.index({ code: 1 });

export default mongoose.model("Coupon", couponSchema);
