// src/models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Compound unique index to allow only one review per user per event
reviewSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
