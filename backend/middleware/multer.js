import multer from "multer";
import path from "path";
import fs from "fs";

// Use the exact same uploads folder as backend/index.js
// Prefer env so it works in both local dev and production.
const ROOT_DIR = process.cwd();
const UPLOADS_FOLDER =
  process.env.UPLOADS_FOLDER || path.join(ROOT_DIR, "uploads");

// Ensure folder exists
fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER); // Save files in the correct folder
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP images and PDF files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max
});