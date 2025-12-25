import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
  try {
    // ✅ JWT ONLY from cookie
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ success: false });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT secret missing in environment",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId for controllers (/me, protected routes)
    req.userId = decoded.sub;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ success: false });
  }
};
