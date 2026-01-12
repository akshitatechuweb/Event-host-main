import User from "../models/User.js";
import bcrypt from "bcryptjs";
import fs from "fs";

// Helper for debug logging
const debugLog = (msg, data = {}) => {
  const logMsg = `[${new Date().toISOString()}] ${msg} ${JSON.stringify(
    data
  )}\n`;
  console.log(logMsg.trim());
  try {
    fs.appendFileSync("admin_debug.log", logMsg);
  } catch (err) {}
};

// Create a new Admin handle (Super Admin only)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, permissions } = req.body;
    debugLog("CREATE ADMIN BODY:", { name, email, phone });

    if (!email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Email, phone and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    // 1. Check if email/phone already belongs to an ADMIN
    const existingAdmin = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
      role: { $in: ["admin", "superadmin"] },
    });

    if (existingAdmin) {
      const conflictMsg =
        existingAdmin.email === normalizedEmail
          ? "An admin with this email already exists"
          : "An admin with this phone number already exists";
      debugLog("CONFLICT WITH EXISTING ADMIN:", {
        id: existingAdmin._id,
        email: existingAdmin.email,
      });
      return res.status(400).json({ success: false, message: conflictMsg });
    }

    // 2. Check if we need to upgrade an existing regular user or create a new one
    // Look for users that have EITHER the same email or the same phone
    const existingUsers = await User.find({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    let user;
    if (existingUsers.length > 1) {
      debugLog(
        "MULTIPLE USERS CONFLICT:",
        existingUsers.map((u) => u._id)
      );
      return res.status(400).json({
        success: false,
        message:
          "Conflict: This email and phone number belong to different existing accounts.",
      });
    } else if (existingUsers.length === 1) {
      user = existingUsers[0];
      debugLog("UPGRADING EXISTING USER:", user._id);
      user.role = "admin";
      user.email = normalizedEmail;
      user.phone = normalizedPhone;
    } else {
      debugLog("CREATING FRESH ADMIN");
      user = new User({
        email: normalizedEmail,
        phone: normalizedPhone,
        role: "admin",
      });
    }

    user.name = name || user.name || "Admin";
    user.password = bcrypt.hashSync(password, 10);
    user.permissions = permissions || {
      users: { read: true, write: false },
      hosts: { read: true, write: false },
      events: { read: true, write: false },
      transactions: { read: true, write: false },
      tickets: { read: true, write: false },
    };
    user.isVerified = true;
    user.isActive = true;
    user.isProfileComplete = true;

    await user.save();
    debugLog("ADMIN CREATED SUCCESSFULLY:", user._id);

    res.status(201).json({
      success: true,
      message: "Admin handle created successfully",
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (error) {
    debugLog("CREATE ADMIN FATAL ERROR:", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to create admin",
      error: error.message,
    });
  }
};

// Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select(
      "name email phone role permissions isActive createdAt"
    );
    res.json({
      success: true,
      admins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admins",
      error: error.message,
    });
  }
};

// Update admin permissions or status
export const updateAdmin = async (req, res) => {
  try {
    const rawId = req.params.id;
    const id = rawId ? rawId.trim() : "";
    const { permissions, isActive, name, email, phone, password } = req.body;
    debugLog("UPDATE ADMIN ATTEMPT:", { id, email, phone });

    const admin = await User.findById(id);
    if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
      debugLog("ADMIN NOT FOUND FOR UPDATE:", id);
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (permissions) admin.permissions = permissions;
    if (isActive !== undefined) admin.isActive = isActive;
    if (name) admin.name = name;

    // Check conflicts
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing._id.toString() !== admin._id.toString()) {
        const roleMsg =
          existing.role === "admin"
            ? "another admin"
            : existing.role === "superadmin"
            ? "a super admin"
            : "an existing user";
        debugLog("EMAIL TAKEN BY:", { roleMsg, id: existing._id });
        return res.status(400).json({
          success: false,
          message: `This email is already in use by ${roleMsg}.`,
        });
      }
      admin.email = normalizedEmail;
    }

    if (phone) {
      const normalizedPhone = phone.trim();
      const existing = await User.findOne({ phone: normalizedPhone });
      if (existing && existing._id.toString() !== admin._id.toString()) {
        const roleMsg =
          existing.role === "admin"
            ? "another admin"
            : existing.role === "superadmin"
            ? "a super admin"
            : "an existing user";
        debugLog("PHONE TAKEN BY:", { roleMsg, id: existing._id });
        return res.status(400).json({
          success: false,
          message: `This phone number is already in use by ${roleMsg}.`,
        });
      }
      admin.phone = normalizedPhone;
    }

    if (password) {
      debugLog("PASSWORD CHANGED FOR:", id);
      admin.password = bcrypt.hashSync(password, 10);
    }

    await admin.save();
    debugLog("UPDATE COMPLETED SUCCESSFULLY:", id);

    res.json({
      success: true,
      message: "Admin updated successfully",
      admin,
    });
  } catch (error) {
    debugLog("UPDATE ADMIN FATAL ERROR:", {
      id: req.params.id,
      error: error.message,
    });

    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Admin ID format" });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update admin",
      error: error.message,
    });
  }
};

// Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const id = req.params.id ? req.params.id.trim() : "";
    const admin = await User.findById(id);

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    admin.role = "user";
    admin.permissions = undefined;
    await admin.save();

    res.json({
      success: true,
      message: "Admin handle removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete admin",
      error: error.message,
    });
  }
};
