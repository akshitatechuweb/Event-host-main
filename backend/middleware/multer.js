// middleware/multer.js
import multer from "multer";
import path from "path";

// Ensure uploads folder exists
import fs from "fs";
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExt = path.extname(file.originalname);
    const filename = uniqueSuffix + originalExt;

    // Force forward slashes (works on Windows + Linux + Mac)
    const normalizedFilename = filename.replace(/\\/g, "/");

    cb(null, normalizedFilename);
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
    cb(new Error("Invalid file type. Only JPG, PNG, WEBP & PDF are allowed."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
    files: 10, // max 10 files at once
  },
});