// types/event.ts
export interface EventPass {
  type: "Male" | "Female" | "Couple";
  price: number;
  totalQuantity: number;
}

export interface Event {
  _id: string;
  eventName: string;
  hostedBy: string;
  date: string;
  city: string;
  currentBookings: number;
  maxCapacity: number;
  eventImage?: string | null;
  status?: "active" | "completed" | "cancelled";
  hostId?: string;
  passes?: EventPass[];

  // Optional fields used in forms (for editing/creating)
  subtitle?: string;
  category?: string | string[];
  time?: string;
  fullAddress?: string;
  about?: string;
  partyFlow?: string;
  whatsIncluded?: string;
  howItWorks?: string;
  whatsIncludedInTicket?: string;
  ageRestriction?: string;
  expectedGuestCount?: string;
  maleToFemaleRatio?: string;
  thingsToKnow?: string;
  partyEtiquette?: string;
  houseRules?: string;
  partyTerms?: string;
  cancellationPolicy?: string;
}