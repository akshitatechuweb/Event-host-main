import User from "../models/User.js";


const calculateProfileCompletion = (user) => {
  let filled = 0;
  const total = 6;

  if (user.name?.trim()) filled++;
  if (user.email?.trim()) filled++;
  if (user.city?.trim()) filled++;
  if (user.gender) filled++;
  if (user.photos?.some(p => p.isProfilePhoto)) filled++;
  if (user.documents?.aadhaar || user.documents?.pan) filled++;

  return Math.round((filled / total) * 100);
};

// Get current user profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
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
    res.json({ success: true, user });
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

    if (user.role !== "guest") {
      return res.status(400).json({ success: false, message: "Only guests can request host role" });
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
    user.isHostRequestPending = false;
    user.isHostVerified = true;
    user.isVerified = true;

    await user.save();

    res.json({ success: true, message: "User promoted to host successfully", user });
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

    res.json({ success: true, message: "User deactivated successfully", user });
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
      user,
      profileCompletion: user.profileCompletion || calculateProfileCompletion(user),
    });
  } catch (error) {
    console.error("Create profile error:", error);
    res.status(500).json({ success: false, message: "Failed to create profile" });
  }
};

// Step 2: Complete Profile → Become Host (MANDATORY: Photo + Aadhaar + PAN)
export const completeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.role === "host") {
      return res.status(400).json({ success: false, message: "You are already a Host" });
    }

    const profilePhoto = req.files?.profilePhoto?.[0];
    const aadhaar = req.files?.aadhaar?.[0];
    const pan = req.files?.pan?.[0];

    if (!profilePhoto || !aadhaar || !pan) {
      return res.status(400).json({
        success: false,
        message: "Profile Photo, Aadhaar & PAN are mandatory to become a Host",
        missing: {
          profilePhoto: !profilePhoto,
          aadhaar: !aadhaar,
          pan: !pan,
        },
      });
    }

    // Replace old profile photo
    user.photos = user.photos.filter(photo => !photo.isProfilePhoto);
    user.photos.push({
      url: profilePhoto.path,
      isProfilePhoto: true,
    });

    // Update documents
    user.documents = {
      aadhaar: aadhaar.path,
      pan: pan.path,
      drivingLicense: req.files?.drivingLicense?.[0]?.path || user.documents.drivingLicense || null,
    };

    // Finalize Host Status
    user.role = "host";
    user.isVerified = true;
    user.isHostVerified = true;
    user.isHostRequestPending = false;

    await user.save();

    res.json({
      success: true,
      message: "Congratulations! You're now a verified Host",
      user,
      profileCompletion: 100,
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    res.status(500).json({ success: false, message: "Failed to complete profile" });
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