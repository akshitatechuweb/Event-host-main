import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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
  secure: isProd,                    // required for HTTPS
  sameSite: isProd ? "none" : "lax", // required for cross-subdomain
  domain: isProd ? ".unrealvibe.com" : undefined,
  path: "/",                         // 🔥 REQUIRED for Next.js SSR
  maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
};

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

    // 🔐 Dummy admin shortcuts
    const isDummyAdmin = phone === "7777777777" && otp === "1234";
    const isDummySuperAdmin = phone === "8888888888" && otp === "5678";

    let user;

    if (isDummyAdmin || isDummySuperAdmin) {
      user = await User.findOne({ phone });

      if (!user) {
        user = await User.create({
          phone,
          name: isDummySuperAdmin ? "Super Admin" : "Admin",
          role: isDummySuperAdmin ? "superadmin" : "admin",
          isVerified: true,
          isHostVerified: true,
          isActive: true,
        });
      } else {
        user.role = isDummySuperAdmin ? "superadmin" : "admin";
        user.isVerified = true;
        user.isHostVerified = true;
        user.isActive = true;
        await user.save();
      }
    } else {
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

      user = await User.findOne({ phone });

      if (!user) {
        user = await User.create({
          phone,
          isVerified: true,
        });
      } else {
        user.isVerified = true;
        await user.save();
      }

      await Otp.deleteOne({ phone });
    }

    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ SET COOKIE (CORRECT & CONSISTENT)
    res.cookie("accessToken", token, authCookieOptions);

    return res.json({
      success: true,
      message: "Login successful",
      role: user.role,
      isProfileComplete: user.isProfileComplete || false,
    });
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
      user,
    });
  } catch {
    return res.status(401).json({ success: false });
  }
};

/* =========================
   🚪 LOGOUT
========================= */

export const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    ...authCookieOptions,
    maxAge: 0,
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};
