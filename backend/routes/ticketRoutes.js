import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  createTicket,
  getTicketsByEvent,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.post("/", authMiddleware, requireRole("host"), createTicket);
router.get("/:eventId", getTicketsByEvent);
router.put("/:id", authMiddleware, requireRole("host"), updateTicket);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("host", "admin"),
  deleteTicket
);

export default router;
