// models/HostRequest.js
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
  },
  { timestamps: true }
);

// Only ONE pending request per user
eventHostRequestSchema.index(
  { userId: 1, status: "pending" },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

export default mongoose.model("EventHostRequest", eventHostRequestSchema);
