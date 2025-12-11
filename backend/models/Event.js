
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostedBy: { type: String, required: true },
    
    eventName: { type: String, required: true },
    eventImage: { type: String }, // This will store the image path

    date: { type: Date, required: true },       
    time: { type: String, required: true },     
    day: { type: String },
    eventDateTime: { type: Date }, // ADD THIS FIELD if you want to store combined date+time

    fullAddress: { type: String, required: true },
    city: { type: String, required: true },

    entryFees: { type: Number, required: true },

    about: { type: String },
    partyFlow: { type: String },
    partyEtiquette: { type: String },
    whatsIncluded: { type: String },
    houseRules: { type: String },
    howItWorks: { type: String },
    cancellationPolicy: { type: String },

    ageRestriction: { type: String },
    category: { type: String },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }
    }
  },
  { timestamps: true }
);

eventSchema.index({ location: "2dsphere" });
eventSchema.index({ date: 1 });

export default mongoose.model("Event", eventSchema);