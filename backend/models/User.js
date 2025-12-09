// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true, sparse: true },
    phone: { type: String, required: true, unique: true, index: true },
    city: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },

    // Documents for verification
    documents: {
      aadhaar: { type: String, default: null },
      pan: { type: String, default: null },
      drivingLicense: { type: String, default: null },
    },

    // Photos
    photos: [
      {
        url: { type: String, required: true },
        isProfilePhoto: { type: Boolean, default: false },
      },
    ],

    profileCompletion: { type: Number, default: 0 },
    isProfileComplete: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ["user", "host", "moderator", "admin", "superadmin"],
      default: "user",
    },

    isVerified: { type: Boolean, default: false },
    isHostRequestPending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto calculate profile completion on save
userSchema.pre("save", function (next) {
  let filled = 0;
  const total = 6;

  if (this.name?.trim()) filled++;
  if (this.email?.trim()) filled++;
  if (this.city?.trim()) filled++;
  if (this.gender) filled++;
  if (this.photos?.some(p => p.isProfilePhoto)) filled++;
  if (this.documents.aadhaar || this.documents.pan || this.documents.drivingLicense) filled++;

  this.profileCompletion = Math.round((filled / total) * 100);
  this.isProfileComplete = this.profileCompletion === 100;

  next();
});

export default mongoose.model("User", userSchema);