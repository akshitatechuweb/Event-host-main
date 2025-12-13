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
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Remove _id from passes subdocuments
        if (ret.passes) {
          ret.passes = ret.passes.map(pass => {
            const { _id, ...cleanPass } = pass;
            return cleanPass;
          });
        }
        return ret;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        // Remove _id from passes subdocuments
        if (ret.passes) {
          ret.passes = ret.passes.map(pass => {
            const { _id, ...cleanPass } = pass;
            return cleanPass;
          });
        }
        return ret;
      }
    }
  }
);

eventSchema.index({ location: "2dsphere" });
eventSchema.index({ date: 1 });

// Virtual field for status
eventSchema.virtual("status").get(function() {
  try {
    const now = new Date();
    const eventDate = this.eventDateTime || this.date;
    
    if (!eventDate || isNaN(eventDate.getTime())) {
      return "";
    }
    
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);
    const daysUntilEvent = hoursUntilEvent / 24;
    
    const createdAt = this.createdAt || now;
    const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
    
    // Calculate booking percentage
    let bookingPercentage = 0;
    if (this.maxCapacity && this.maxCapacity > 0 && this.currentBookings >= 0) {
      bookingPercentage = (this.currentBookings / this.maxCapacity) * 100;
    }
    
    // PRIORITY 1: Almost Full - 85%+ filled
    if (bookingPercentage >= 85) {
      return "Almost Full";
    }
    
    // PRIORITY 2: Filling Fast - within 48 hours (2 days)
    if (daysUntilEvent <= 2 && daysUntilEvent > 0) {
      return "Filling Fast";
    }
    
    // PRIORITY 3: High Demand - 50%+ bookings
    if (bookingPercentage >= 50) {
      return "High Demand";
    }
    
    // PRIORITY 4: Just Started - within 48 hours of creation
    if (hoursSinceCreation <= 48) {
      return "Just Started";
    }
    
    return "";
  } catch (error) {
    console.error("Error calculating event status:", error);
    return "";
  }
});

export default mongoose.model("Event", eventSchema);