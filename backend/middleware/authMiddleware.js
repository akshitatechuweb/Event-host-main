import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* =================================================
   🔐 AUTH MIDDLEWARE
================================================= */

export const authMiddleware = async (req, res, next) => {
  try {
    // ✅ Read cookie safely
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // ✅ Fetch minimal required fields only
    const user = await User.findById(decoded.sub).select(
      "_id email role isVerified isActive name phone photos"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Optional safety check (won't break OTP/users)
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    // 🔑 Attach user to request
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

/* =================================================
   🛡️ ROLE-BASED ACCESS CONTROL
================================================= */

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  next();
};
