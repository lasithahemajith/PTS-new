import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import MentorStudentMap from "../models/mentorStudentMapModel.js";

// GET /messages/recipients – available recipients for the current user
export const getAvailableRecipients = async (req, res) => {
  const { role, id } = req.user;

  try {
    let groups = [];

    if (role === "Student") {
      // Assigned mentors
      const maps = await MentorStudentMap.find({ studentId: id }).populate(
        "mentorId",
        "name email role"
      );
      const mentors = maps.map((m) => m.mentorId).filter(Boolean);

      // All tutors (as a group option)
      const tutors = await User.find({ role: "Tutor" }).select("_id name email role");

      groups = [
        { label: "My Mentors", type: "individual", users: mentors },
        { label: "All Tutors", type: "broadcast", broadcastType: "all_tutors", users: tutors },
      ];
    } else if (role === "Mentor") {
      // Assigned students
      const maps = await MentorStudentMap.find({ mentorId: id }).populate(
        "studentId",
        "name email role"
      );
      const students = maps.map((m) => m.studentId).filter(Boolean);

      // All tutors (as a group option)
      const tutors = await User.find({ role: "Tutor" }).select("_id name email role");

      groups = [
        { label: "My Students", type: "individual", users: students },
        { label: "All Tutors", type: "broadcast", broadcastType: "all_tutors", users: tutors },
      ];
    } else if (role === "Tutor") {
      // Tutors can select any combination of students and mentors
      const students = await User.find({ role: "Student" }).select("_id name email role");
      const mentors = await User.find({ role: "Mentor" }).select("_id name email role");

      groups = [
        { label: "Students", type: "individual", users: students },
        { label: "Mentors", type: "individual", users: mentors },
      ];
    }

    res.json({ groups });
  } catch (err) {
    console.error("❌ getAvailableRecipients error:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /messages – send a message
export const sendMessage = async (req, res) => {
  const { role, id } = req.user;
  const { subject, body, recipientIds, broadcastType } = req.body;

  try {
    if (!subject || !body) {
      return res.status(400).json({ error: "Subject and body are required" });
    }

    let resolvedRecipientIds = [];

    if (broadcastType) {
      // Validate broadcast is allowed for the role (students/mentors broadcast to all tutors only)
      const allowedBroadcasts = {
        Student: ["all_tutors"],
        Mentor: ["all_tutors"],
      };

      if (!allowedBroadcasts[role]?.includes(broadcastType)) {
        return res.status(403).json({ error: "Broadcast type not allowed for your role" });
      }

      const roleMap = {
        all_tutors: "Tutor",
      };

      const targetRole = roleMap[broadcastType];
      const users = await User.find({ role: targetRole }).select("_id");
      resolvedRecipientIds = users.map((u) => u._id.toString());
    } else if (Array.isArray(recipientIds) && recipientIds.length > 0) {
      // Validate individual recipients based on role
      if (role === "Student") {
        // Students can only message their assigned mentors
        const maps = await MentorStudentMap.find({ studentId: id });
        const allowedIds = new Set(maps.map((m) => m.mentorId.toString()));
        for (const rid of recipientIds) {
          if (!allowedIds.has(rid)) {
            return res
              .status(403)
              .json({ error: "You can only send messages to your assigned mentors" });
          }
        }
      } else if (role === "Mentor") {
        // Mentors can only message their assigned students
        const maps = await MentorStudentMap.find({ mentorId: id });
        const allowedIds = new Set(maps.map((m) => m.studentId.toString()));
        for (const rid of recipientIds) {
          if (!allowedIds.has(rid)) {
            return res
              .status(403)
              .json({ error: "You can only send messages to your assigned students" });
          }
        }
      } else if (role === "Tutor") {
        // Tutors can message any combination of students and mentors
        const recipientUsers = await User.find({ _id: { $in: recipientIds } }).select("role");
        for (const u of recipientUsers) {
          if (!["Student", "Mentor"].includes(u.role)) {
            return res
              .status(403)
              .json({ error: "Tutors can only message students and mentors" });
          }
        }
      }
      resolvedRecipientIds = recipientIds;
    } else {
      return res.status(400).json({ error: "At least one recipient is required" });
    }

    // Exclude sender from recipients
    resolvedRecipientIds = resolvedRecipientIds.filter((uid) => uid !== id.toString());

    if (resolvedRecipientIds.length === 0) {
      return res.status(400).json({ error: "No valid recipients found" });
    }

    const message = await Message.create({
      senderId: id,
      subject,
      body,
      recipients: resolvedRecipientIds.map((uid) => ({ userId: uid, read: false })),
    });

    res.status(201).json({ message: "Message sent successfully", data: message });
  } catch (err) {
    console.error("❌ sendMessage error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /messages/inbox – messages received by the current user
export const getInbox = async (req, res) => {
  const { id } = req.user;

  try {
    const messages = await Message.find({ "recipients.userId": id })
      .populate("senderId", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);

    const result = messages.map((msg) => {
      const recipient = msg.recipients.find((r) => r.userId.toString() === id.toString());
      return {
        _id: msg._id,
        sender: msg.senderId,
        subject: msg.subject,
        body: msg.body,
        read: recipient ? recipient.read : false,
        createdAt: msg.createdAt,
      };
    });

    const unreadCount = result.filter((m) => !m.read).length;

    res.json({ messages: result, unreadCount });
  } catch (err) {
    console.error("❌ getInbox error:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET /messages/sent – messages sent by the current user
export const getSent = async (req, res) => {
  const { id } = req.user;

  try {
    const messages = await Message.find({ senderId: id })
      .populate("recipients.userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ messages });
  } catch (err) {
    console.error("❌ getSent error:", err);
    res.status(500).json({ error: err.message });
  }
};

// PATCH /messages/:id/read – mark a message as read for the current user
export const markMessageAsRead = async (req, res) => {
  const { id: userId } = req.user;
  const { id: messageId } = req.params;

  try {
    const message = await Message.findOneAndUpdate(
      { _id: messageId, "recipients.userId": userId },
      { $set: { "recipients.$.read": true } },
      { new: true }
    );

    if (!message) return res.status(404).json({ error: "Message not found" });

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("❌ markMessageAsRead error:", err);
    res.status(500).json({ error: err.message });
  }
};
