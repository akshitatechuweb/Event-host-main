// routes/adminRoutes.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  approveEventHost,
  rejectEventHost,
  getAllHostRequests,
} from "../controllers/adminController.js";
import { requestEventHostAccess } from "../controllers/hostController.js";

const router = express.Router();

router.use(authMiddleware, requireRole("admin", "superadmin"));



router.post("/request", authMiddleware, requestEventHostAccess);
router.get("/host-requests", getAllHostRequests);
router.put("/host-requests/approve/:id", approveEventHost);
router.put("/host-requests/reject/:id", rejectEventHost);

export default router;