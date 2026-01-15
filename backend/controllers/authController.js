import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendSms } from "../utils/sendSms.js";

dotenv.config();

/* =================================================
   🍪 COOKIE CONFIG (SINGLE SOURCE OF TRUTH)
================================================= */

const isProd = process.env.NODE_ENV === "production";
const isLocalhost = process.env.FRONTEND_URL?.includes("localhost");

const authCookieOptions = {
  httpOnly: true,

  // 🔑 Secure ONLY when frontend is HTTPS
  secure: isProd && !isLocalhost,

  // 🔑 Cross-site only when actually cross-site
  sameSite: isProd && !isLocalhost ? "none" : "lax",

  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/* =================================================
   📩 REQUEST OTP (USERS)
================================================= */

export const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { phone },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await sendSms(phone, otp);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      otp, // ⚠️ REMOVE IN PRODUCTION
    });
  } catch (err) {
    console.error("OTP send error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

/* =================================================
   💬 VERIFY OTP (USERS)
================================================= */

export const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body || {};

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    const otpRecord = await Otp.findOne({ phone, otp });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        isVerified: true,
      });
    } else {
      // 🚀 Check if account is deactivated
      if (user.isActive === false) {
        return res.status(403).json({
          success: false,
          message:
            "This account has been deactivated. Please use a different phone number to register.",
        });
      }
      user.isVerified = true;
      await user.save();
    }

    await Otp.deleteOne({ phone });

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔑 Cookie (web)
    res.cookie("accessToken", token, authCookieOptions);

    return res.json({
      success: true,
      token,
      role: user.role,
      isProfileComplete: user.isProfileComplete || false,
    });
  } catch (err) {
    console.error("OTP verify error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/* =================================================
   🔐 ADMIN / SUPERADMIN LOGIN
================================================= */

const ADMIN = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  role: "admin",
};

// Hardcoded Super Admin as per request
const SUPERADMIN = {
  email: "superadmin@gmail.com",
  password: "superadmin@123",
  role: "superadmin",
};

const ADMIN_HASH = bcrypt.hashSync(ADMIN.password || "admin123", 10);
const SUPERADMIN_HASH = bcrypt.hashSync(SUPERADMIN.password, 10);

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    console.log("BACKEND ADMIN LOGIN ATTEMPT:", { email });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing credentials",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });

    let role, hash, name, phone;
    let isMatch = false;

    // 1. Check if user exists in DB and has a password set
    if (user && user.password) {
      if (bcrypt.compareSync(password, user.password)) {
        isMatch = true;
        role = user.role;
      }
    }

    // 2. Fallback to hardcoded admin check (preserve previous behaviour)
    if (!isMatch) {
      if (normalizedEmail === ADMIN.email) {
        role = "admin";
        hash = ADMIN_HASH;
        name = "Admin";
        phone = "8888888888";
      } else if (normalizedEmail === SUPERADMIN.email) {
        role = "superadmin";
        hash = SUPERADMIN_HASH;
        name = "Super Admin";
        phone = "9999999999";
      }

      if (role && hash && bcrypt.compareSync(password, hash)) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user) {
      const fullPermissions = {
        users: { read: true, write: true },
        hosts: { read: true, write: true },
        events: { read: true, write: true },
        transactions: { read: true, write: true },
        tickets: { read: true, write: true },
      };

      user = await User.create({
        email: normalizedEmail,
        phone,
        name,
        role,
        isVerified: true,
        isActive: true,
        isProfileComplete: true,
        permissions: role === "superadmin" ? fullPermissions : undefined,
      });
    } else {
      // 🚀 IMPORTANT: If they logged in with hardcoded credentials,
      // ensure their DB role and permissions are elevated/synced.
      let needsSave = false;
      if (role && user.role !== role) {
        console.log(`ELEVATING USER ${user.email} TO ${role}`);
        user.role = role;
        needsSave = true;
      }

      if (user.role === "superadmin") {
        const fullPermissions = {
          users: { read: true, write: true },
          hosts: { read: true, write: true },
          events: { read: true, write: true },
          transactions: { read: true, write: true },
          tickets: { read: true, write: true },
        };
        // Use JSON.stringify for a simple deep compare if needed, or just overwrite
        user.permissions = fullPermissions;
        needsSave = true;
      }

      if (needsSave) {
        await user.save();
      }
    }

    const token = jwt.sign(
      { sub: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ COOKIE IS SET HERE (ONLY HERE)
    res.cookie("accessToken", token, authCookieOptions);

    return res.json({
      success: true,
      role: user.role,
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/* =================================================
   👤 ADMIN SESSION + LOGOUT (ADMIN-ONLY)
================================================= */

// Simple "who am I" endpoint for admin panel and middleware
export const adminMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!["admin", "superadmin"].includes(user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    let profilePhoto = user.photos?.find((p) => p.isProfilePhoto)?.url || null;
    if (profilePhoto && profilePhoto.startsWith("/")) {
      profilePhoto = `${req.protocol}://${req.get("host")}${profilePhoto}`;
    }

    return res.json({
      success: true,
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions, // 🚩 FIX: Required for frontend usePermissions hook
      profilePhoto,
    });
  } catch (err) {
    console.error("Admin me error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Session check failed" });
  }
};

// Clear the httpOnly auth cookie while keeping OTP/user flow untouched
export const adminLogout = (req, res) => {
  try {
    res.clearCookie("accessToken", authCookieOptions);
    return res.json({ success: true });
  } catch (err) {
    console.error("Admin logout error:", err);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};
