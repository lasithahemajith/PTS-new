import Notification from "../models/notificationModel.js";

/**
 * Create a notification for one or more users.
 * @param {Object|Object[]} notificationData - Single or array of notification objects { userId, type, message, relatedId }
 */
export const createNotification = async (notificationData) => {
  try {
    if (Array.isArray(notificationData)) {
      await Notification.insertMany(notificationData);
    } else {
      await Notification.create(notificationData);
    }
  } catch (err) {
    console.error("❌ createNotification error:", err);
  }
};
