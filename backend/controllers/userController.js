import User from "../models/User.js";

// Calculate profile Completion
const calculateProfileCompletion = (user) => {
  let totalFields = 5;
  let filled = 0;

  if (user.name) filled++;
  if (user.city) filled++;
  if (user.bio) filled++;
  if (user.photos && user.photos.length > 0) filled++;
  if (user.profileDetails?.age && user.profileDetails?.gender) filled++;

  return Math.round((filled / totalFields) * 100);
};

// 🔹 Get current user (from JWT auth middleware)
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch profile" });
  }
};

// 🔹 Get user by ID (admin/moderator)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

// 🔹 Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    Object.assign(user, updates);

    user.profileCompletion = calculateProfileCompletion(user);
    if (user.profileCompletion === 100) {
      user.isVerified = true;
    } else {
      user.isVerified = false;
    }

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// 2️⃣ Request to become host
export const requestHostUpgrade = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "guest")
      return res
        .status(400)
        .json({ message: "Only guests can request host role" });

    if (user.profileCompletion < 100)
      return res
        .status(400)
        .json({ message: "Complete profile before requesting host" });

    user.isHostRequestPending = true;
    await user.save();

    // later: notify admin via email / socket / dashboard
    res.json({ message: "Host request submitted successfully" });
  } catch (err) {
    console.error("Request host error:", err);
    res.status(500).json({ message: "Error submitting request" });
  }
};

export const approveHostUpgrade = async (req, res) => {
  try {
    const { id } = req.params; // user id
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isHostRequestPending)
      return res.status(400).json({ message: "No pending host request" });

    user.role = "host";
    user.isHostRequestPending = false;
    user.isHostVerified = true;
    await user.save();

    res.json({ message: "User promoted to host", user });
  } catch (err) {
    console.error("Approve host error:", err);
    res.status(500).json({ message: "Error approving host" });
  }
};

//  Get all users (Admin) — with pagination, filtering, sorting, and projection
export const getAllUsers = async (req, res) => {
  try {
    // 1️⃣ Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    //  Filters (search by role, city, verification, name, phone)
    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.city) filters.city = new RegExp(req.query.city, "i");
    if (req.query.isVerified)
      filters.isVerified = req.query.isVerified === "true";
    if (req.query.search) {
      filters.$or = [
        { name: new RegExp(req.query.search, "i") },
        { phone: new RegExp(req.query.search, "i") },
        { email: new RegExp(req.query.search, "i") },
      ];
    }

    //  Sorting
    const sortField = req.query.sortBy || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    // Select only needed fields
    const selectFields = req.query.fields?.replace(/,/g, " ") || "";

    // Query
    const [users, total] = await Promise.all([
      User.find(filters)
        .select(selectFields)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filters),
    ]);

    // Response with pagination meta
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

// Deactivate user (admin or self)
export const deactivateUser = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deactivated successfully", user });
  } catch (err) {
    console.error("Error deactivating user:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to deactivate user" });
  }
};


// ADD THIS FUNCTION in your userController.js

export const completeProfile = async (req, res) => {
  try {
    const { name, email, city, gender } = req.body;

    if (!name || !city || !gender) {
      return res.status(400).json({
        success: false,
        message: "Name, City and Gender are required",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.name = name.trim();
    if (email?.trim()) user.email = email.trim();
    user.city = city.trim();
    user.gender = gender;

    await user.save(); // pre-save hook auto sets isProfileComplete = true

    return res.json({
      success: true,
      message: "Profile completed successfully!",
      user,
      isProfileComplete: true,
    });
  } catch (error) {
    console.error("Complete profile error:", error);
    res.status(500).json({ success: false, message: "Failed to save profile" });
  }
};