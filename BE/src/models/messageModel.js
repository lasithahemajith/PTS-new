import mongoose from "mongoose";

const recipientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    read: { type: Boolean, default: false },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    recipients: [recipientSchema],
  },
  { timestamps: true }
);

messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ "recipients.userId": 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
