import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requestEventHosting } from "../controllers/eventController.js";

const router = express.Router();

// User / Host sends event host request
router.post("/request", authMiddleware, requestEventHosting);
router.post("/request/:id", authMiddleware, requestEventHosting);

export default router;
