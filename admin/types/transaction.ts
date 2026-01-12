/* ======================================================
   TRANSACTION & BOOKING TYPES (ADMIN)
====================================================== */

/* ---------- Transaction Status ---------- */
export type TransactionStatus = "pending" | "completed" | "failed" | "refunded";

/* ---------- Booking Item (Pass Info) ---------- */
export interface BookingItem {
  passType: "Male" | "Female" | "Couple";
  price: number;
  quantity: number;
}

/* ---------- Buyer Info ---------- */
export interface Buyer {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

/* ---------- Booking Summary ---------- */
export interface BookingSummary {
  _id: string;
  orderId: string;
  totalAmount: number;
  ticketCount: number;
  items: BookingItem[];
  buyer?: Buyer | null;
}

/* ---------- Transaction ---------- */
export interface Transaction {
  _id: string;
  bookingId?: string;

  amount: number;
  platformFee?: number;
  payoutToHost?: number;

  providerTxnId?: string;
  status: TransactionStatus;

  createdAt: string;
  updatedAt?: string;

  booking?: BookingSummary | null;
}

/* ---------- Totals / Aggregates ---------- */
export interface TransactionTotals {
  totalRevenue: number;
  totalTransactions: number;
  totalTickets: number;
}

/* ---------- API Response ---------- */
export interface EventTransactionsResponse {
  success: boolean;
  transactions: Transaction[];
  totals: TransactionTotals;
  message?: string;
  meta?: {
    totalItems: number;
    currentPage: number;
    limit: number;
    totalPages: number;
  };
}
