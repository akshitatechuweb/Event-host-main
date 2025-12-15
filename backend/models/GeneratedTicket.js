import mongoose from "mongoose";

const generatedTicketSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    ticketNumber: { type: String, required: true, unique: true },
   qrCode: {
  type: String,
  required: true,
  unique: true,
},


    attendee: {
      fullName: String,
      email: String,
      phone: String,
      gender: String,
    },

    ticketType: { type: String, required: true },
    price: { type: Number, required: true },

    status: {
      type: String,
      enum: ["active", "used", "cancelled"],
      default: "active",
    },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("GeneratedTicket", generatedTicketSchema);