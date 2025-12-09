
import multer from "multer";
import path from "path";
import fs from "fs";

// Auto create uploads folder
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const cleanFilename = unique + ext; 

    cb(null, cleanFilename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Invalid file type"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 },
});