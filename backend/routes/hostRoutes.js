import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requestEventHostAccess } from "../controllers/hostController.js";

const router = express.Router();

// User / Host sends event host request
router.post("/request", authMiddleware, requestEventHostAccess);

export default router;
