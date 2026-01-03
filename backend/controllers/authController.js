import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendSms } from "../utils/sendSms.js";

dotenv.config();

/* =========================
   COOKIE CONFIG (SINGLE SOURCE OF TRUTH)
========================= */

const isProd = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProd, // HTTPS only in prod
  sameSite: isProd ? "none" : "lax", // cross-site safe
  path: "/", // REQUIRED for Next.js SSR
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// In production, optionally scope cookie to a parent domain (e.g. .unrealvibe.com)
// so that BOTH api.unrealvibe.com (backend) and unrealvibe.com (Next.js) see it.
// Set COOKIE_DOMAIN=".unrealvibe.com" in production.
if (isProd && process.env.COOKIE_DOMAIN) {
  authCookieOptions.domain = process.env.COOKIE_DOMAIN;
}

/* =========================
   📩 REQUEST OTP
========================= */

export const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { phone },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    console.log(`🔢 OTP for ${phone}: ${otp}`);

    const smsResponse = await sendSms(phone, otp);

    if (!smsResponse?.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent successfully",
      otp, // ⚠️ REMOVE IN PRODUCTION
    });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

/* =========================
   💬 VERIFY OTP
========================= */

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body || {};
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    // Normal OTP flow (admin/superadmin now use email/password login)
    const otpRecord = await Otp.findOne({ phone, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ phone });
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      const newUser = await User.create({
        phone,
        isVerified: true,
      });
      await Otp.deleteOne({ phone });
      
      const token = jwt.sign({ sub: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("accessToken", token, authCookieOptions);

      return res.json({
        success: true,
        message: "OTP verified successfully. Please create your profile.",
        role: newUser.role,
        isProfileComplete: newUser.isProfileComplete || false,
        token: token,
      });
    } else {
      user.isVerified = true;
      await user.save();
      await Otp.deleteOne({ phone });

      const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("accessToken", token, authCookieOptions);

      return res.json({
        success: true,
        message: "Welcome back! Login successful.",
        role: user.role,
        isProfileComplete: user.isProfileComplete || false,
        token: token,
      });
    }

  } catch (error) {
    console.error("❌ OTP verification failed:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};


/* =========================
   👤 GET CURRENT USER
========================= */

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-__v");
    if (!user) {
      return res.status(401).json({ success: false });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        role: user.role,
      },
    });
  } catch {
    return res.status(401).json({ success: false });
  }
};

/* =========================
   🚪 LOGOUT
========================= */

export const logout = async (req, res) => {
  // Use the same cookie attributes as login so the browser can reliably
  // clear the cookie regardless of environment.
  res.clearCookie("accessToken", {
    ...authCookieOptions,
    maxAge: 0,
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};

/* =========================
   🔐 ADMIN LOGIN (Email/Password)
========================= */

// Hardcoded admin credentials (can be overridden via env vars)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || "admin@gmail.com",
  password: process.env.ADMIN_PASSWORD || "admin@123",
  role: "admin",
};

const SUPERADMIN_CREDENTIALS = {
  email: process.env.SUPERADMIN_EMAIL || "superadmin@gmail.com",
  password: process.env.SUPERADMIN_PASSWORD || "superadmin@123",
  role: "superadmin",
};

// Hash passwords on module load (only once)
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_CREDENTIALS.password, 10);
const SUPERADMIN_PASSWORD_HASH = bcrypt.hashSync(SUPERADMIN_CREDENTIALS.password, 10);

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check if it's admin or superadmin
    let isAdmin = false;
    let isSuperAdmin = false;
    let passwordHash = null;
    let expectedRole = null;

    if (normalizedEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      isAdmin = true;
      passwordHash = ADMIN_PASSWORD_HASH;
      expectedRole = "admin";
    } else if (normalizedEmail === SUPERADMIN_CREDENTIALS.email.toLowerCase()) {
      isSuperAdmin = true;
      passwordHash = SUPERADMIN_PASSWORD_HASH;
      expectedRole = "superadmin";
    }

    // Only allow admin/superadmin emails
    if (!isAdmin && !isSuperAdmin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password, passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Find or create admin user
    // First, try to find by email
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // If not found by email, check if a user with the admin phone number exists
      // (this handles cases where admin was created via old /create-admin endpoint)
      const adminPhone = isSuperAdmin ? "9999999999" : "8888888888";
      user = await User.findOne({ phone: adminPhone });

      if (user) {
        // Update existing user with admin phone to have correct email and role
        user.email = normalizedEmail;
        user.role = expectedRole;
        user.name = isSuperAdmin ? "Super Admin" : "Admin";
        user.isVerified = true;
        user.isHostVerified = true;
        user.isActive = true;
        user.isProfileComplete = true;
        await user.save();
      } else {
        // No user found with email or phone - create new admin user
        try {
          user = await User.create({
            email: normalizedEmail,
            phone: adminPhone, // Dummy phone for admin accounts
            name: isSuperAdmin ? "Super Admin" : "Admin",
            role: expectedRole,
            isVerified: true,
            isHostVerified: true,
            isActive: true,
            isProfileComplete: true,
          });
        } catch (createError) {
          // If creation fails due to duplicate phone (race condition), find and update
          if (createError.code === 11000 && createError.keyPattern?.phone) {
            user = await User.findOne({ phone: adminPhone });
            if (user) {
              user.email = normalizedEmail;
              user.role = expectedRole;
              user.name = isSuperAdmin ? "Super Admin" : "Admin";
              user.isVerified = true;
              user.isHostVerified = true;
              user.isActive = true;
              user.isProfileComplete = true;
              await user.save();
            } else {
              throw createError; // Re-throw if we still can't find the user
            }
          } else {
            throw createError; // Re-throw other errors
          }
        }
      }
    } else {
      // User found by email - update to ensure correct role and status
      user.role = expectedRole;
      user.isVerified = true;
      user.isHostVerified = true;
      user.isActive = true;
      if (!user.name) {
        user.name = isSuperAdmin ? "Super Admin" : "Admin";
      }
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("accessToken", token, authCookieOptions);

    return res.json({
      success: true,
      message: "Admin login successful",
      role: user.role,
      token: token, // Fallback for cookie extraction
    });
  } catch (error) {
    console.error("❌ Admin login failed:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
