import API from "./axios";

export const fetchNotifications = () => API.get("/notifications");

export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);

export const markAllNotificationsRead = () => API.patch("/notifications/read-all");
