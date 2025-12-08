import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import bookingRouts from "./routes/bookingRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import hostRoutes from "./routes/hostRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use( cors({ origin: [ 
  "http://localhost:3000",
   "http://127.0.0.1:3000", 
   "http://localhost:3001",
    "http://127.0.0.1:3001",
     "http://192.168.18.1:3000", 
     "http://192.168.18.1:3001", 
     "http://192.168.18.1:5173",
      "http://localhost:5173", 
      "http://127.0.0.1:5173", 
      "http://api.unrealvibe.com" 
    ],
    credentials: true,
  })
);

// Connect to Database
connectDB();

app.get("/", (req, res) => {
  res.send("✅ Server is running successfully!");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/booking", bookingRouts);
app.use("/api/ticket", ticketRoutes);
app.use("/api/host", hostRoutes);  

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;
