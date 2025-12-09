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
    message: {
      type: String,
      default: "I want permission to host events.",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

// Only one PENDING request per user (but multiple approved/rejected allowed)
eventHostRequestSchema.index(
  { userId: 1, status: "pending" },
  { 
    unique: true,
    partialFilterExpression: { status: "pending" }
  }
);

export default mongoose.model("EventHostRequest", eventHostRequestSchema);