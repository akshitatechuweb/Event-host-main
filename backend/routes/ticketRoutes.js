// routes/ticketRoutes.js
import express from "express";
import { generateTicket, getTicket, getUserTickets } from "../controllers/ticketController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", generateTicket);
router.get("/details", getTicket);
router.get("/my-tickets", authMiddleware, getUserTickets);

export default router;