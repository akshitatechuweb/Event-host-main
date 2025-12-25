import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendSms } from "../utils/sendSms.js";

dotenv.config();

// ===========================
// 📩 REQUEST OTP
// ===========================
export const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    if (!process.env.RENFLAIR_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Renflair API Key missing in .env file",
      });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Save OTP in DB
    await Otp.findOneAndUpdate(
      { phone },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    console.log(`🔢 OTP for ${phone}: ${otp}`);

    // Send SMS
    const smsResponse = await sendSms(phone, otp);
    console.log("📨 Renflair API Response:", smsResponse);

    if (!smsResponse) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. SMS service not responding.",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent successfully",
      otp, // ⚠️ remove in production
      details: smsResponse,
    });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

// ===========================
// 💬 VERIFY OTP
// ===========================
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
    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ phone });
      return res
        .status(400)
        .json({ success: false, message: "OTP expired" });
    }

    let user = await User.findOne({ phone });
    let responseMessage = "";

    if (!user) {
      // New user
      user = await User.create({ phone, isVerified: true });
      responseMessage =
        "OTP verified successfully. Please create your profile.";
    } else {
      // Existing user
      user.isVerified = true;
      await user.save();
      responseMessage = "Welcome back! Login successful.";
    }

    await Otp.deleteOne({ phone });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: JWT secret missing",
      });
    }

    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: responseMessage,
      token,
      isProfileComplete: user.isProfileComplete || false,
    });
  } catch (error) {
    console.error("OTP verification failed:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ===========================
// 👤 GET CURRENT USER (/me)
// ===========================
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

// ===========================
// 🚪 LOGOUT
// ===========================
export const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};
