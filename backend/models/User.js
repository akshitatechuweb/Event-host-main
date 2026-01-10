import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String }, // For admin/superadmin login and password change
    city: { type: String, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },

    // Always present fields (with defaults)
    bio: { type: String, trim: true, maxlength: 500, default: "" },
    funFact: { type: String, trim: true, maxlength: 300, default: "" },
    interests: { type: [String], default: [] },

    // Verification docs
    documents: {
      aadhaar: { type: String, default: null },
      pan: { type: String, default: null },
      drivingLicense: { type: String, default: null },
    },

    // Photos
    photos: {
      type: [
        {
          url: { type: String, required: true },
          isProfilePhoto: { type: Boolean, default: false },
        },
      ],
      default: [],
    },

    profileCompletion: { type: Number, default: 0 },
    isProfileComplete: { type: Boolean, default: false },

    // Role & Host System
    role: {
      type: String,
      enum: ["user", "host", "moderator", "admin", "superadmin"],
      default: "user",
    },
    isHost: { type: Boolean, default: false },

    eventsHosted: { type: Number, default: 0 },
    eventCreationCredits: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    isHostVerified: { type: Boolean, default: false },
    isHostRequestPending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // === SAVED / BOOKMARKED EVENTS ===
    savedEvents: [
      {
        event: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
          required: true,
        },
        savedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // === NEW: USER LOCATION FOR GEO QUERIES ===
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ "savedEvents.event": 1 }); // For counting saves per event
userSchema.index({ role: 1 });
userSchema.index({ location: "2dsphere" }); // Crucial for geo queries
userSchema.index({ city: 1 }); // Helpful for city-based filters

// Auto-calculate profile completion + auto-upgrade to host
userSchema.pre("save", function (next) {
  let completion = 0;

  const hasName = !!this.name?.trim();
  const hasCity = !!this.city?.trim();
  const hasGender = !!this.gender;
  const hasProfilePhoto = this.photos.some((p) => p.isProfilePhoto);
  const hasDocs = !!this.documents?.aadhaar && !!this.documents?.pan;

  // Step 1: Basic info → 33%
  if (hasName && hasCity && hasGender) {
    completion = 33;

    // Step 2: Profile photo → 66%
    if (hasProfilePhoto) {
      completion = 66;

      // Step 3: Documents → 100%
      if (hasDocs) {
        completion = 100;
      }
    }
  }

  this.profileCompletion = completion;
  this.isProfileComplete = completion === 100;

  // Auto-promote to verified host when 100%
  if (completion === 100 && hasDocs) {
    this.isHost = true;
    this.role = "host";
    this.isVerified = true;
    this.isHostVerified = true;
    this.isHostRequestPending = false;
  }

  next();
});

export default mongoose.model("User", userSchema);