import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import morgan from "morgan";
import fs from "fs";

// === ALL YOUR ROUTES (including the ones you had commented out) ===
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRouts from "./routes/bookingRoutes.js";     
import ticketRoutes from "./routes/ticketRoutes.js";     
import hostRoutes from "./routes/hostRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";   
import adminRoutes from "./routes/adminRoutes.js";
import passRoutes from "./routes/passRoutes.js";
import sseRoutes from "./routes/sseRoutes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ────────────────── ABSOLUTE PATH = NO MORE PATH ERRORS ──────────────────
// This is the only correct folder where images are stored and served
const UPLOADS_FOLDER = "/var/www/unrealvibes/uploads";

// Create the folder automatically if it doesn't exist
fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
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
    ],
    credentials: true,
  })
);

// ─────────────── SERVE IMAGES CORRECTLY (THIS FIXES EVERYTHING) ───────────────
app.use("/uploads", express.static(UPLOADS_FOLDER));

// Database
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Server is running! Images are now served correctly.");
});

// === ALL ROUTES ===
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/booking", bookingRouts);
app.use("/api/ticket", ticketRoutes);
app.use("/api/host", hostRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/passes", passRoutes);
app.use("/api/sse", sseRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Images → http://api.unrealvibe.com/uploads/filename.png`);
});

export default app;