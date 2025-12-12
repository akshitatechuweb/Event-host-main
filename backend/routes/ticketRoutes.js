import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  createTicket,
  getTicketsByEvent,
  updateTicket,
  deleteTicket,
  generateMultipleTickets
} from "../controllers/ticketController.js";
import { verifyGeneratedTicket } from "../controllers/ticketController.js";

const router = express.Router();

// MUST COME FIRST
router.post("/generate-multiple", authMiddleware, generateMultipleTickets);
// Verify / Scan generated ticket
router.post("/verify", authMiddleware, requireRole("host"), verifyGeneratedTicket);

// Host creates a ticket type
router.post("/", authMiddleware, requireRole("host"), createTicket);

// Get tickets for an event
router.get("/:eventId", getTicketsByEvent);

// Update ticket
router.put("/:id", authMiddleware, requireRole("host"), updateTicket);

// Delete ticket
router.delete("/:id", authMiddleware, requireRole("host", "admin"), deleteTicket);

export default router;