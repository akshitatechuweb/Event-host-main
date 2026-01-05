import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import morgan from "morgan";
import fs from "fs";
import path from "path";

// === ALL YOUR ROUTES (including the ones you had commented out) ===
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRouts from "./routes/bookingRoutes.js";     
import hostRoutes from "./routes/hostRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";   
import adminRoutes from "./routes/adminRoutes.js";
import passRoutes from "./routes/passRoutes.js";
import sseRoutes from "./routes/sseRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ────────────────── UPLOADS FOLDER (SHARED WITH MULTER) ──────────────────
// Use env so the same code works locally and in production.
// Must stay in sync with backend/middleware/multer.js
const ROOT_DIR = process.cwd();
const UPLOADS_FOLDER =
  process.env.UPLOADS_FOLDER || path.join(ROOT_DIR, "uploads");

// Create the folder automatically if it doesn't exist
fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// CORS configuration for cross-domain cookie support
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
  "http://192.168.18.1:3000",
  "http://192.168.18.1:3001",
  "http://192.168.18.1:5173",
  "https://api.unrealvibe.com",
  "https://unrealvibe.com",
  "https://www.unrealvibe.com",
  "https://admin.unrealvibe.com",
  "https://event-host-main.vercel.app"
];

// Allow additional origins from environment variable (comma-separated)
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, be more permissive
        if (process.env.NODE_ENV !== "production") {
          console.warn(`⚠️  CORS: Allowing unlisted origin in dev: ${origin}`);
          callback(null, true);
        } else {
          console.error(`❌ CORS: Blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
    // Required for cookies with sameSite: "none"
    optionsSuccessStatus: 200,
  })
);

// ─────────────── SERVE IMAGES CORRECTLY (THIS FIXES EVERYTHING) ───────────────
app.use("/uploads", express.static(UPLOADS_FOLDER));

// Backward-compat placeholder used by older frontends when an event has no image.
// Returns a tiny 1x1 transparent PNG so existing UI logic keeps working.
app.get("/placeholder.png", (req, res) => {
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAA6fptVAAAADUlEQVQI12NgYGBgAAAABQABDQottAAAAABJRU5ErkJggg==";
  const imgBuffer = Buffer.from(base64, "base64");
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Length", imgBuffer.length);
  res.send(imgBuffer);
});

// Database and start server after a successful DB connection
// This ensures the app doesn't accept requests before DB is ready.
const startServer = async () => {
  await connectDB();

  // Test route
  app.get("/", (req, res) => {
    res.send("Server is running! Images are now served correctly.");
  });

  // === ALL ROUTES ===
  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/event", eventRoutes);
  app.use("/api/booking", bookingRouts);
  app.use("/api/host", hostRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/passes", passRoutes);
  app.use("/api/sse", sseRoutes);
  app.use("/api/notifications", notificationRoutes);

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Images → http://api.unrealvibe.com/uploads/filename.png`);
  });
};

startServer();

export default app;