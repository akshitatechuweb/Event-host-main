import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { generateUploadSignature } from "../services/cloudinary.js";

const router = express.Router();

/**
 * @route POST /api/upload/signature
 * @desc Generate a signed signature for Cloudinary upload
 * @access Private
 */
router.post("/signature", authMiddleware, (req, res) => {
    try {
        const { folder, publicId } = req.body;

        if (!folder) {
            return res.status(400).json({
                success: false,
                message: "Folder parameter is required",
            });
        }

        // Basic Security: Ensure folder starts with an allowed prefix
        const allowedPrefixes = ["events", "users", "hosts", "tickets"];
        const isValidPrefix = allowedPrefixes.some((prefix) =>
            folder === prefix || folder.startsWith(prefix + "/")
        );

        if (!isValidPrefix) {
            return res.status(400).json({
                success: false,
                message: `Invalid folder destination: ${folder}`,
            });
        }

        // RBAC: Non-admins should only upload to their own user/host folders
        // Note: We'll refine this as needed, but this is a good baseline.
        const isAdmin = ["admin", "superadmin"].includes(req.user.role);
        const userId = req.user._id.toString();

        if (!isAdmin) {
            // Allow if folder includes their userId (covers users/ID/avatar and hosts/ID/profile)
            if (folder.includes(userId)) {
                // OK
            }
            // Allow events folder if they are a host (we trust they won't spam other event folders for now, 
            // but in a production app we'd check event ownership if publicId is provided)
            else if (folder.startsWith("events/") && req.user.role === "host") {
                // OK
            }
            else {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to upload to this folder",
                });
            }
        }

        const signatureData = generateUploadSignature(folder, publicId);

        res.json({
            success: true,
            ...signatureData,
        });
    } catch (error) {
        console.error("Signature generation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate upload signature",
        });
    }
});

export default router;
