import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    qrCode: {
      type: String,
      unique: true,
    },

    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "canceled", "checked_in"],
      default: "requested",
    },

    pricePaid: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentProviderId: {
      type: String,
      trim: true,
    },

    refundStatus: {
      type: String,
      enum: ["none", "requested", "refunded", "failed"],
      default: "none",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
