import API from "./axios";

export const fetchInbox = () => API.get("/messages/inbox");
export const fetchSent = () => API.get("/messages/sent");
export const fetchRecipients = () => API.get("/messages/recipients");
export const sendMessage = (payload) => API.post("/messages", payload);
export const markMessageRead = (id) => API.patch(`/messages/${id}/read`);
