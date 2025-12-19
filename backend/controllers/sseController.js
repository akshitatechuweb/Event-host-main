// controllers/sseController.js
import Notification from "../models/Notification.js";

// Store all active SSE clients (userId → response)
const clients = new Map(); // Better than Set because we can target by userId

export const sseConnect = (req, res) => {
  const userId = req.user?._id?.toString();

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Set required SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable proxy buffering (important for Nginx)
  res.flushHeaders();

  // Store the client
  clients.set(userId, res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: "connected", message: "Real-time notifications connected" })}\n\n`);

  // Heartbeat every 15 seconds to prevent timeout
  const heartbeat = setInterval(() => {
    res.write(":\n\n");
  }, 15000);

  // Cleanup when client disconnects
  req.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(userId);
    res.end();
  });

  req.on("error", () => {
    clearInterval(heartbeat);
    clients.delete(userId);
  });
};

// Function to send notification to specific users or everyone
export const broadcastNotification = async (data, targetUserIds = null) => {
  const payload = `data: ${JSON.stringify(data)}\n\n`;

  // Persist targeted notifications (only when we have target user ids and persist !== false)
  if (targetUserIds && data?.persist !== false) {
    try {
      const docs = targetUserIds.map((userId) => ({
        userId,
        type: data.type || "generic",
        title: data.title || "",
        message: data.message || "",
        meta: data.meta || {},
      }));
      // insertMany is fine for small batches; controllers targeting many users should be careful
      await Notification.insertMany(docs);
    } catch (err) {
      console.error("Failed to persist notifications:", err);
    }
  }

  if (targetUserIds) {
    // Send only to specific users
    targetUserIds.forEach((userId) => {
      const clientRes = clients.get(userId.toString());
      if (clientRes && !clientRes.writableEnded) {
        clientRes.write(payload);
      }
    });
  } else {
    // Broadcast to ALL connected clients
    clients.forEach((clientRes) => {
      if (!clientRes.writableEnded) {
        clientRes.write(payload);
      }
    });
  }
};