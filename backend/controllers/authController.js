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

    // Check if ServerMSG credentials are present
    if (
      !process.env.SERVERMSG_USERID ||
      !process.env.SERVERMSG_PASSWORD ||
      !process.env.SERVERMSG_SENDERID ||
      !process.env.SERVERMSG_ENTITYID ||
      !process.env.SERVERMSG_TEMPLATEID
    ) {
      return res.status(500).json({
        success: false,
        message: "ServerMSG SMS credentials missing in .env file",
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

    // Send SMS via ServerMSG
    const smsResponse = await sendSms(phone, otp);

    if (!smsResponse || !smsResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP via ServerMSG.",
        details: smsResponse?.data || "No response",
      });
    }

    return res.json({
      success: true,
      message: "OTP sent successfully via ServerMSG",
      otp, // ⚠️ remove in production
      details: smsResponse.data,
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

    /* =====================================================
       🔐 DUMMY ADMIN / SUPERADMIN LOGIN (DEV SHORTCUT)
    ===================================================== */
    const isDummyAdmin =
      phone === "7777777777" && otp === "1234";

    const isDummySuperAdmin =
      phone === "8888888888" && otp === "5678";

    if (isDummyAdmin || isDummySuperAdmin) {
      let user = await User.findOne({ phone });

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

      const token = jwt.sign(
        { sub: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("accessToken", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // localhost safe
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: "Admin login successful",
        token,
        role: user.role,
        isProfileComplete: true,
      });
    }

    /* =====================================================
       🔁 NORMAL USER OTP FLOW (UNCHANGED)
    ===================================================== */
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

    let user = await User.findOne({ phone });
    let responseMessage = "";

    if (!user) {
      user = await User.create({ phone, isVerified: true });
      responseMessage =
        "OTP verified successfully. Please create your profile.";
    } else {
      user.isVerified = true;
      await user.save();
      responseMessage = "Welcome back! Login successful.";
    }

    await Otp.deleteOne({ phone });

    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
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
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
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
