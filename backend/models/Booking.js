// import mongoose from "mongoose";

// const bookingSchema = new mongoose.Schema(
//   {
//     eventId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Event",
//       required: true,
//     },

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     ticketTypeId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Ticket",
//       required: true,
//     },
//     qrCode: {
//       type: String,
//       unique: true,
//     },

//     status: {
//       type: String,
//       enum: ["requested", "approved", "rejected", "canceled", "checked_in"],
//       default: "requested",
//     },

//     pricePaid: {
//       type: Number,
//       required: true,
//       min: 0,
//     },

//     paymentProviderId: {
//       type: String,
//       trim: true,
//     },

//     refundStatus: {
//       type: String,
//       enum: ["none", "requested", "refunded", "failed"],
//       default: "none",
//     },
//   },
//   { timestamps: true }
// );

// const Booking = mongoose.model("Booking", bookingSchema);
// export default Booking;















// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // null for guest

  // Booking Name (must!)
  bookingName: { type: String, required: true, trim: true },
  bookingEmail: { type: String, required: true, trim: true, lowercase: true },
  bookingPhone: { type: String, required: true, trim: true },

  ticketCount: { type: Number, default: 1, min: 1, max: 10 },
  totalAmount: { type: Number, required: true },

  // Razorpay
  orderId: { type: String, required: true },
  paymentId: { type: String },
  paymentStatus: { type: String, enum: ["pending", "success", "failed"], default: "pending" },

  // QR Code for entry
  qrCode: { type: String },

  status: { type: String, enum: ["confirmed", "cancelled", "checked_in"], default: "confirmed" },
}, { timestamps: true });

bookingSchema.index({ eventId: 1 });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ qrCode: 1, sparse: true });

export default mongoose.model("Booking", bookingSchema);