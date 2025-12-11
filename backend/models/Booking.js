import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    eventId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Event", 
      required: true 
    },

    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },

    attendee: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      gender: { type: String, enum: ["Male", "Female", "Other"], required: true }
    },

    ticketTypeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Ticket" 
    },

    ticketCount: { 
      type: Number, 
      default: 1, 
      min: 1, 
      max: 10 
    },

    totalAmount: { 
      type: Number, 
      required: true 
    },

    orderId: { 
      type: String, 
      required: true 
    },

    paymentId: { 
      type: String 
    },

    signature: { 
      type: String 
    },

    status: { 
      type: String,
      enum: ["pending", "confirmed", "failed", "cancelled"],
      default: "pending"
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;