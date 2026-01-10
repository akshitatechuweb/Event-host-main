import User from "../models/User.js";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Helper to geocode city (reused pattern from event creation)
const geocodeCity = async (city) => {
  if (!city?.trim()) return null;

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: `${city.trim()}, India`, // Adjust country if your app supports others
          key: GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng };
    }
    return null;
  } catch (error) {
    console.warn("Geocoding failed for city:", city, error.message);
    return null;
  }
};

// Get current user profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

// Get user by ID (Admin)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

// Request to become host (old flow - kept for backward compatibility)
export const requestHostUpgrade = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.role !== "user") {
      return res.status(400).json({ success: false, message: "Only users can request host role" });
    }

    if (user.profileCompletion < 80) {
      return res.status(400).json({ success: false, message: "Complete your profile first" });
    }

    user.isHostRequestPending = true;
    await user.save();

    res.json({ success: true, message: "Host request submitted successfully" });
  } catch (err) {
    console.error("Request host error:", err);
    res.status(500).json({ success: false, message: "Error submitting request" });
  }
};

// Approve host request (Admin)
export const approveHostUpgrade = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.isHostRequestPending) {
      return res.status(400).json({ success: false, message: "No pending host request" });
    }

    user.role = "host";
    user.isHost = true;
    user.isHostRequestPending = false;
    user.isHostVerified = true;
    user.isVerified = true;

    await user.save();

    res.json({
      success: true,
      message: "User promoted to host successfully",
      user
    });
  } catch (err) {
    console.error("Approve host error:", err);
    res.status(500).json({ success: false, message: "Error approving host" });
  }
};

// Get all users (Admin) - with filters

export const getAllUsers = async (req, res) => {
  try {
    // Summary mode for dashboard
    if (req.query.summary === "true") {
      const users = await User.find({})
        .select("_id")
        .lean();

      return res.status(200).json({
        success: true,
        users: users || [],
      });
    }

    // List mode for Admin Panel
    const users = await User.find({})
      .select("name email phone city gender role isHost isVerified isActive createdAt profileCompletion")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      users: users || [],
    });
  } catch (err) {
    console.error("❌ Admin users failed:", err);

    // 🔑 Never fail dashboard
    return res.status(200).json({
      success: true,
      users: [],
    });
  }
};



// Deactivate user (Admin or self)
export const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deactivated successfully",
      user
    });
  } catch (err) {
    console.error("Error deactivating user:", err);
    res.status(500).json({ success: false, message: "Failed to deactivate user" });
  }
};

// Step 1: Create Basic Profile
export const createProfile = async (req, res) => {
  try {
    const { name, email, city, gender } = req.body;

    if (!name?.trim() || !city?.trim() || !gender) {
      return res.status(400).json({
        success: false,
        message: "Name, City and Gender are required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.role === "host") {
      return res.status(400).json({ success: false, message: "Profile already completed" });
    }

    user.name = name.trim();
    user.city = city.trim();
    user.gender = gender;
    if (email?.trim()) user.email = email.trim().toLowerCase();

    // Geocode the city
    const geo = await geocodeCity(user.city);
    if (geo) {
      user.location = {
        type: "Point",
        coordinates: [geo.lng, geo.lat],
      };
    }

    await user.save();

    res.json({
      success: true,
      message: "Basic profile created successfully!",
      user
    });
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).json({ success: false, message: "Failed to create profile" });
  }
};

// Complete/Update Profile - Unified endpoint
export const completeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let cityChanged = false;
    let newCity = user.city;

    // Basic fields
    if (req.body.name?.trim()) user.name = req.body.name.trim();
    if (req.body.city?.trim()) {
      newCity = req.body.city.trim();
      if (user.city !== newCity) {
        user.city = newCity;
        cityChanged = true;
      }
    }
    if (req.body.email?.trim()) user.email = req.body.email.trim().toLowerCase();
    if (req.body.gender) user.gender = req.body.gender;

    // Optional rich fields - always set (even if empty)
    user.bio = req.body.bio?.trim() ?? "";
    user.funFact = req.body.funFact?.trim() ?? "";

    // Interests - ensure it's always an array
    if (req.body.interests !== undefined) {
      if (typeof req.body.interests === "string") {
        try {
          user.interests = JSON.parse(req.body.interests);
        } catch {
          user.interests = req.body.interests.split(",").map((i) => i.trim()).filter(Boolean);
        }
      } else if (Array.isArray(req.body.interests)) {
        user.interests = req.body.interests;
      } else {
        user.interests = [];
      }
    }

    // Profile Photo
    if (req.files?.profilePhoto) {
      const photoUrl = `/uploads/${req.files.profilePhoto[0].filename}`;
      // Remove old profile photo flag
      user.photos = user.photos.map((p) => ({ ...p, isProfilePhoto: false }));
      user.photos.push({ url: photoUrl, isProfilePhoto: true });
    }

    // Documents
    if (req.files) {
      if (req.files.aadhaar) {
        user.documents.aadhaar = `/uploads/${req.files.aadhaar[0].filename}`;
      }
      if (req.files.pan) {
        user.documents.pan = `/uploads/${req.files.pan[0].filename}`;
      }
      if (req.files.drivingLicense) {
        user.documents.drivingLicense = `/uploads/${req.files.drivingLicense[0].filename}`;
      }
    }

    // Geocode only if city changed or never geocoded before
    if (cityChanged || (user.location.coordinates[0] === 0 && user.location.coordinates[1] === 0)) {
      const geo = await geocodeCity(user.city);
      if (geo) {
        user.location = {
          type: "Point",
          coordinates: [geo.lng, geo.lat],
        };
      }
    }

    await user.save();

    let message = "Profile updated successfully!";
    if (user.profileCompletion === 100 && user.isHost) {
      message = "Congratulations! You're now a verified Host";
    } else if (user.profileCompletion === 33) {
      message = "Basic info saved! Now add a profile photo.";
    } else if (user.profileCompletion === 66) {
      message = "Looking great! Upload Aadhaar & PAN to become a Host.";
    }

    res.json({
      success: true,
      message,
      user,
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};