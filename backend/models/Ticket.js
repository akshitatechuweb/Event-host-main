// models/Ticket.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    ticketNumber: {
      type: String,
      required: true,
      unique: true
    },

    qrCode: {
      type: String,
      required: true
    },

    attendee: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      gender: { type: String, required: true }
    },

    ticketCount: {
      type: Number,
      required: true,
      default: 1
    },

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["active", "used", "cancelled", "expired"],
      default: "active"
    },

    checkedInAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;