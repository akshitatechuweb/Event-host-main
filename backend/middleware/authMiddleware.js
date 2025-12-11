// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.cookies?.accessToken;

    // If no token → treat as guest and continue
    if (!token) {
      return next();
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    // If user not found or token invalid in some way → treat as guest
    if (!user) {
      return next();
    }

    // Valid authenticated user
    req.user = user;
    next();
  } catch (err) {
    // Any error (expired, malformed token) → treat as guest
    console.error("Auth middleware error:", err);
    return next();
  }
};