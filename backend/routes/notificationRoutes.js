import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  listNotifications,
  markRead,
  deleteNotification,
  unreadCount,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authMiddleware, listNotifications);
router.get("/count", authMiddleware, unreadCount);
router.post("/mark-read", authMiddleware, markRead);
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
