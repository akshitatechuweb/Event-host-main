import mongoose from "mongoose";

const eventHostRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    preferredPartyDate: {
      type: Date,
      required: true,
    },

    locality: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
    },

    // ✅ ADD THESE (THIS IS THE FIX)
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Only ONE pending request per user
eventHostRequestSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

export default mongoose.model("EventHostRequest", eventHostRequestSchema);
