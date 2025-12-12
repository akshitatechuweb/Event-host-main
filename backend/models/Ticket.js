// models/Ticket.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 }
    },
    refundPolicy: { type: String, default: "" },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;