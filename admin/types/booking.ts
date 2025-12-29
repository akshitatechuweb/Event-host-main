/* ======================================================
   BOOKING TYPES (EVENT / TRANSACTIONS)
====================================================== */

/* ---------- Booking Status ---------- */
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "failed"
  | "cancelled";

/* ---------- Pass / Ticket Item ---------- */
export interface BookingItem {
  passType: "Male" | "Female" | "Couple";
  price: number;
  quantity: number;
}

/* ---------- Attendee Info ---------- */
export interface Attendee {
  fullName: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other";
  passType: "Male" | "Female" | "Couple";
}

/* ---------- Buyer / User ---------- */
export interface BookingUser {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

/* ---------- Booking ---------- */
export interface Booking {
  _id: string;

  eventId: string;

  userId?: string;
  user?: BookingUser | null;

  attendees?: Attendee[];

  ticketTypeId?: string;

  ticketCount: number;

  items: BookingItem[];

  totalAmount: number;

  orderId: string;
  paymentId?: string;
  signature?: string;

  qrCode?: string;

  status: BookingStatus;

  createdAt: string;
  updatedAt: string;
}

/* ---------- Lightweight Booking Summary (for Transactions) ---------- */
export interface BookingSummary {
  _id: string;
  orderId: string;
  totalAmount: number;
  ticketCount: number;
  items: BookingItem[];
  buyer?: BookingUser | null;
}

/* ---------- API Response Shapes ---------- */
export interface BookingListResponse {
  success: boolean;
  bookings: Booking[];
  message?: string;
}

export interface BookingResponse {
  success: boolean;
  booking: Booking;
  message?: string;
}
