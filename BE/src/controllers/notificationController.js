import Notification from "../models/notificationModel.js";

// GET notifications for the current user (last 20, sorted newest first)
const NOTIFICATION_LIMIT = 20;

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(NOTIFICATION_LIMIT);
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("❌ getNotifications error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH mark a single notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json({ message: "Marked as read", notification });
  } catch (err) {
    console.error("❌ markAsRead error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("❌ markAllAsRead error:", err);
    res.status(500).json({ error: err.message });
  }
};
