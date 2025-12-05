import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  createBooking,
  getMyBookings,
  getHostBookings,
  getAllBookings,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.get("/my", authMiddleware, getMyBookings);
router.get("/host", authMiddleware, requireRole("host"), getHostBookings);
router.get("/admin", authMiddleware, requireRole("admin", "superadmin"), getAllBookings);

export default router;
