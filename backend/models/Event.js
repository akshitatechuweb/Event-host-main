// src/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostedBy: { type: String, required: true },
    eventName: { type: String, required: true },
    subtitle: { type: String, default: "" },
    eventImage: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    day: { type: String },
    eventDateTime: { type: Date },
    fullAddress: { type: String, required: true },
    city: { type: String, required: true },
    about: { type: String },
    partyFlow: { type: String },
    partyEtiquette: { type: String },
    whatsIncluded: { type: String },
    houseRules: { type: String },
    howItWorks: { type: String },
    cancellationPolicy: { type: String },
    ageRestriction: { type: String },
    whatsIncludedInTicket: { type: String, default: "" },
    expectedGuestCount: { type: String, default: "" },
    maleToFemaleRatio: { type: String, default: "" },
    category: { type: String },
    thingsToKnow: { type: String, default: "" },
    partyTerms: { type: String, default: "" },
    maxCapacity: { type: Number },
    currentBookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
totalReviews: { type: Number, default: 0 },
    
    
    shareCount: {
  type: Number,
  default: 0,
},

sharedBy: [
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  },
],

    passes: [
      {
        type: { type: String, enum: ["Male", "Female", "Couple"], required: true },
        price: { type: Number, required: true, default: 0 },
        totalQuantity: { type: Number, required: true, default: 0 },
        remainingQuantity: { type: Number, required: true, default: 0 },
      }
    ],
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);





// === INDEXES FOR FAST SEARCH ===
eventSchema.index({ location: "2dsphere" });
eventSchema.index({ eventDateTime: 1 });
eventSchema.index({ city: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ city: 1, eventDateTime: 1 });
eventSchema.index({ category: 1, eventDateTime: 1 });

// Full-text search on name, subtitle, about
eventSchema.index(
  { eventName: "text", subtitle: "text", about: "text" },
  { weights: { eventName: 10, subtitle: 5, about: 1 }, name: "event_text_search" }
);

// Keep old date index if needed
eventSchema.index({ date: 1 });

// === TRANSFORM: Remove _id from passes ===
const transformPasses = (doc, ret) => {
  if (ret.passes) {
    ret.passes = ret.passes.map(pass => {
      const { _id, ...clean } = pass;
      return clean;
    });
  }
  return ret;
};

eventSchema.set("toJSON", { transform: transformPasses });
eventSchema.set("toObject", { transform: transformPasses });

// === VIRTUAL: status ===
eventSchema.virtual("status").get(function () {
  try {
    const now = new Date();
    const eventDate = this.eventDateTime || this.date;
    if (!eventDate || isNaN(eventDate.getTime())) return "";

    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
    const daysUntilEvent = hoursUntilEvent / 24;
    const hoursSinceCreation = (now - (this.createdAt || now)) / (1000 * 60 * 60);

    let bookingPercentage = 0;
    if (this.maxCapacity && this.maxCapacity > 0 && this.currentBookings >= 0) {
      bookingPercentage = (this.currentBookings / this.maxCapacity) * 100;
    }

    if (bookingPercentage >= 85) return "Almost Full";
    if (daysUntilEvent <= 2 && daysUntilEvent > 0) return "Filling Fast";
    if (bookingPercentage >= 50) return "High Demand";
    if (hoursSinceCreation <= 48) return "Just Started";

    return "";
  } catch (error) {
    return "";
  }
});






export default mongoose.model("Event", eventSchema);