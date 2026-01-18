import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

// Publicly accessible coupon routes can be added here if needed
// Currently, coupon application is integrated into the payment flow.

export default router;
