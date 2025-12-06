// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, index: true, unique: true, sparse: true },
    phone: {
      type: String,
      index: true,
      unique: true,
      sparse: true,
      required: true,
    },

    city: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"] },

    //  Document Uploads for host verification
    documents: {
      aadhaar: { type: String, default: null },
      pan: { type: String, default: null },
      drivingLicense: { type: String, default: null },
    },

    // Profile Photo
    photos: [
      {
        url: String,
        isProfilePhoto: { type: Boolean, default: false },
      },
    ],

    // Profile Progress
    profileCompletion: { type: Number, default: 0 },
    isProfileComplete: { type: Boolean, default: false },

    // Role system
    role: {
      type: String,
      enum: ["guest", "host", "moderator", "admin", "superadmin"],
      default: "guest",
    },

    bio: { type: String, maxlength: 500, default: "" },

    isVerified: { type: Boolean, default: false },
    isHostRequestPending: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// AUTO PROFILE COMPLETION (for basic profile info)
userSchema.pre("save", function (next) {
  let filled = 0;
  const totalFields = 4;
  if (this.name?.trim()) filled++;
  if (this.email?.trim()) filled++;
  if (this.city?.trim()) filled++;
  if (this.gender) filled++;

  this.profileCompletion = Math.round((filled / totalFields) * 100);
  this.isProfileComplete = this.profileCompletion === 100;

  next();
});

const User = mongoose.model("User", userSchema);
export default User;
