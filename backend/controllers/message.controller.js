import Message from "../models/message.model.js";
import { io, userSocketMap } from "../index.js";

// ======================================================
// SEND MESSAGE
// ======================================================
// Route: POST /api/message/send/:receiverId
// req.userId comes from isAuth middleware (the sender)
export const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { text } = req.body;
    const senderId = req.userId;

    // 1. Save the message to MongoDB first — this is the "permanent record"
    //    so the chat history is still there even if both people are offline.
    let newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
    });

    // 2. Fill in sender/receiver details (name, photo) before sending back,
    //    same reason as the createPost fix — the frontend needs the full
    //    profile, not just a raw ID.
    newMessage = await newMessage.populate(
      "sender",
      "firstName lastName userName profileImage"
    );
    newMessage = await newMessage.populate(
      "receiver",
      "firstName lastName userName profileImage"
    );

    // 3. If the receiver is currently online (their socket id is registered),
    //    push the message to them instantly — this is the "real-time" part.
    //    If they're offline, they'll just see it next time they open the chat,
    //    because it's already saved in the database from step 1.
    const receiverSocketId = userSocketMap.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);
  } catch (error) {
    return res.status(500).json({
      message: `Send message error: ${error.message}`,
    });
  }
};

// ======================================================
// GET MESSAGES (conversation history between two users)
// ======================================================
// Route: GET /api/message/:otherUserId
export const getMessages = async (req, res) => {
  try {
    const myId = req.userId;
    const { otherUserId } = req.params;

    // A conversation is every message where (I sent it to them)
    // OR (they sent it to me) — $or covers both directions.
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
    })
      .sort({ createdAt: 1 }) // oldest first, like a real chat thread
      .populate("sender", "firstName lastName userName profileImage")
      .populate("receiver", "firstName lastName userName profileImage");

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({
      message: `Get messages error: ${error.message}`,
    });
  }
};