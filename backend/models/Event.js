import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostedBy: { type: String, required: true },
    eventName: { type: String, required: true },
    eventImage: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true }, 
    fullAddress: { type: String, required: true },
    city: { type: String, required: true },
    entryFees: { type: Number, required: true },
    about: { type: String },
    ageRestriction: { type: String },
    genderPreference: { type: String, default: "both" },
    categories: [{ type: String }],
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true } // [lng, lat]
    }
  },
  { timestamps: true }
);

eventSchema.index({ location: "2dsphere" });

export default mongoose.model("Event", eventSchema);
