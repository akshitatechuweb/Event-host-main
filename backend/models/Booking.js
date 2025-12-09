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

  // Booking Details (UPI wala user daalega)
  bookingName: { type: String, required: true },
  bookingEmail: { type: String, required: true },
  bookingPhone: { type: String, required: true },

  ticketCount: { type: Number, default: 1, min: 1, max: 10 },
  totalAmount: { type: Number, required: true },

  // Razorpay Payment
  orderId: { type: String, required: true },
  paymentId: { type: String },
  signature: { type: String },

  status: { 
    type: String, 
    enum: ["pending", "confirmed", "failed", "cancelled"], 
    default: "pending" 
  },
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);