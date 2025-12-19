import Notification from "../models/Notification.js";

// GET /api/notifications?unread=true&page=1&limit=20
export const listNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);

    const filter = { userId };

    if (req.query.unread === "true") {
      filter.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments(filter),
    ]);

    res.json({ success: true, notifications, total, page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// POST /api/notifications/mark-read
// body: { ids: [id1, id2] } or { all: true }
export const markRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { notification_ids, all } = req.body || {};  

    if (all === true) {  
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      return res.json({ success: true, marked_read: "all" });
    }

    if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Provide notification_ids array or set all: true" 
      });
    }

    const result = await Notification.updateMany(
      { _id: { $in: notification_ids }, userId },
      { isRead: true, readAt: new Date() }
    );

    res.json({ 
      success: true, 
      marked_read: result.modifiedCount 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to mark notifications" });
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const deleted = await Notification.findOneAndDelete({ _id: id, userId });
    if (!deleted) return res.status(404).json({ success: false, message: "Notification not found" });

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
};

// GET /api/notifications/count -> unread count
export const unreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, isRead: false });
    res.json({ success: true, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch unread count" });
  }
};
