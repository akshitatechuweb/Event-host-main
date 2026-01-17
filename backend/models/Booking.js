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
    },

    attendees: [
      {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        gender: {
          type: String,
          enum: ["Male", "Female", "Other"],
          required: true,
        },
        passType: {
          type: String,
          enum: ["Male", "Female", "Couple"],
          required: true,
        },
      },
    ],

    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },

    ticketCount: {
      type: Number,
      default: 1,
      min: 1,
      max: 20,
    },
    items: [
      {
        passType: {
          type: String,
          enum: ["Male", "Female", "Couple"],
          required: true,
        },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    appliedCouponCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    orderId: {
      type: String,
      required: true,
    },

    paymentId: {
      type: String,
    },

    signature: {
      type: String,
    },

    qrCode: {
      type: String,
      default: undefined,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "failed", "cancelled"],
      default: "pending",
    },
    redirectUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

// Only enforce uniqueness for documents where a non-null qrCode exists
// Use a sparse unique index: documents without `qrCode` are not indexed,
// so multiple documents without a qrCode won't conflict. We avoid using
// partialFilterExpression to keep compatibility with older MongoDB versions.
bookingSchema.index({ qrCode: 1 }, { unique: true, sparse: true });
bookingSchema.index({ userId: 1, appliedCouponCode: 1 }); // For fast per-user limit checks
bookingSchema.index({ eventId: 1, status: 1 }); // For general reports/auditing

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
