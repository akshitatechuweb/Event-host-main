import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    quantity: {
      total: {
        type: Number,
        required: true,
        min: 0,
      },
      available: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    refundPolicy: {
      type: String,
      enum: [
        "non-refundable",
        "partial-refund",
        "full-refund",
        "custom-policy",
      ],
      default: "non-refundable",
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("TicketType", ticketSchema);
export default Ticket;
