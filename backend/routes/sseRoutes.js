// routes/sseRoutes.js
import express from "express";
import { sseConnect } from "../controllers/sseController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected SSE endpoint for real-time notifications
router.get("/notifications", authMiddleware, sseConnect);

export default router;