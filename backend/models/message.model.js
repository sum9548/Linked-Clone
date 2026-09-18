import mongoose from "mongoose";

// A single chat message between two users.
// Think of each document in this collection as one text bubble in a chat.
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    // Optional: lets you support image messages later, same pattern as posts
    image: {
      type: String,
      default: "",
    },
  },
  {
    // Adds createdAt / updatedAt automatically — you'll use createdAt
    // to sort messages in order and show timestamps.
    timestamps: true,
  },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
