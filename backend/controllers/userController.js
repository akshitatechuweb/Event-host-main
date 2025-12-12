import User from "../models/User.js";

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.city) filters.city = new RegExp(req.query.city, "i");
    if (req.query.isVerified) filters.isVerified = req.query.isVerified === "true";
    if (req.query.search) {
      filters.$or = [
        { name: new RegExp(req.query.search, "i") },
        { phone: new RegExp(req.query.search, "i") },
        { email: new RegExp(req.query.search, "i") },
      ];
    }

    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;
    const selectFields = req.query.fields?.replace(/,/g, " ") || "";

    const [users, total] = await Promise.all([
      User.find(filters)
        .select(selectFields || "-password")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filters),
    ]);

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      users,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
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

    // Basic fields
    if (req.body.name?.trim()) user.name = req.body.name.trim();
    if (req.body.city?.trim()) user.city = req.body.city.trim();
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