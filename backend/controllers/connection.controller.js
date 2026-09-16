import Connection from "../models/connection.model.js";
import User from "../models/user.model.js";
import { io, userSocketMap } from "../index.js";
import Notification from "../models/notification.model.js";

// ======================================================
// SEND CONNECTION REQUEST
// ======================================================

export const sendConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const sender = req.userId;

    // Don't send request to yourself
    if (sender.toString() === id.toString()) {
      return res.status(400).json({
        message: "You cannot send a connection request to yourself",
      });
    }

    const user = await User.findById(sender);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Already connected?
    if (user.connection.includes(id)) {
      return res.status(400).json({
        message: "You are already connected",
      });
    }

    // Check existing pending request
    const existingConnection = await Connection.findOne({
      sender,
      receiver: id,
      status: "pending",
    });

    if (existingConnection) {
      return res.status(400).json({
        message: "Connection request already exists",
      });
    }

    // Create request
    const newRequest = await Connection.create({
      sender,
      receiver: id,
      status: "pending",
    });

    // ==================================================
    // SOCKET.IO REAL-TIME UPDATE
    // ==================================================

    const receiverSocketId = userSocketMap.get(id.toString());
    const senderSocketId = userSocketMap.get(sender.toString());

    // Notify receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: sender.toString(),
        newStatus: "received",
      });
    }

    // Notify sender
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: id.toString(),
        newStatus: "pending",
      });
    }

    return res.status(201).json(newRequest);
  } catch (error) {
    console.error("Send connection error:", error);

    return res.status(500).json({
      message: `Send connection error: ${error.message}`,
    });
  }
};

// ======================================================
// ACCEPT CONNECTION
// ======================================================

export const acceptConnection = async (req, res) => {
  try {
   
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        message: "Connection request does not exist",
      });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({
        message: "Request is already processed",
      });
    }

    // Make sure the logged-in user is the receiver
    if (connection.receiver.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to accept this request",
      });
    }

    // Update connection status
    connection.status = "accepted";

     const notification = await Notification.create({
            receiver:connection.sender,
            type:"connectionAccepted",
            relatedUser: req.userId,
             })
    

    await connection.save();

    // Add each user to the other's connection array
    await User.findByIdAndUpdate(req.userId, {
      $addToSet: {
        connection: connection.sender,
      },
    });

    await User.findByIdAndUpdate(connection.sender, {
      $addToSet: {
        connection: req.userId,
      },
    });

    // ==================================================
    // SOCKET.IO
    // ==================================================

    const receiverSocketId = userSocketMap.get(
      connection.receiver.toString(),
    );

    const senderSocketId = userSocketMap.get(
      connection.sender.toString(),
    );

    // Receiver sees "connected"
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: connection.sender.toString(),
        newStatus: "connected",
      });
    }

    // Sender sees "connected"
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: connection.receiver.toString(),
        newStatus: "connected",
      });
    }

    return res.status(200).json({
      message: "Connection accepted",
    });
  } catch (error) {
    console.error("Accept connection error:", error);

    return res.status(500).json({
      message: `Connection accepted error: ${error.message}`,
    });
  }
};

// ======================================================
// REJECT CONNECTION
// ======================================================

export const rejectConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return res.status(404).json({
        message: "Connection request does not exist",
      });
    }

    if (connection.status !== "pending") {
      return res.status(400).json({
        message: "Request is already processed",
      });
    }

    // Only receiver can reject
    if (connection.receiver.toString() !== req.userId.toString()) {
      return res.status(403).json({
        message: "You are not allowed to reject this request",
      });
    }

    connection.status = "rejected";
    await connection.save();

    // ==================================================
    // SOCKET.IO
    // ==================================================

    const receiverSocketId = userSocketMap.get(
      connection.receiver.toString(),
    );

    const senderSocketId = userSocketMap.get(
      connection.sender.toString(),
    );

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: connection.sender.toString(),
        newStatus: "connect",
      });
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: connection.receiver.toString(),
        newStatus: "connect",
      });
    }

    return res.status(200).json({
      message: "Connection request rejected",
    });
  } catch (error) {
    console.error("Reject connection error:", error);

    return res.status(500).json({
      message: `Connection rejected error: ${error.message}`,
    });
  }
};

// ======================================================
// GET CONNECTION STATUS
// ======================================================

export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Already connected
    if (
      currentUser.connection.some(
        (id) => id.toString() === targetUserId.toString(),
      )
    ) {
      return res.status(200).json({
        status: "connected",
      });
    }

    // Check pending request in either direction
    const pendingRequest = await Connection.findOne({
      $or: [
        {
          sender: currentUserId,
          receiver: targetUserId,
        },
        {
          sender: targetUserId,
          receiver: currentUserId,
        },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      // Current user sent request
      if (
        pendingRequest.sender.toString() ===
        currentUserId.toString()
      ) {
        return res.status(200).json({
          status: "pending",
          requestId: pendingRequest._id,
        });
      }

      // Current user received request
      return res.status(200).json({
        status: "received",
        requestId: pendingRequest._id,
      });
    }

    return res.status(200).json({
      status: "connect",
    });
  } catch (error) {
    console.error("Get connection status error:", error);

    return res.status(500).json({
      message: `Get connection status error: ${error.message}`,
    });
  }
};

// ======================================================
// REMOVE CONNECTION
// ======================================================

export const removeConnection = async (req, res) => {
  try {
    const myId = req.userId;
    const otherUserId = req.params.userId;

    await User.findByIdAndUpdate(myId, {
      $pull: {
        connection: otherUserId,
      },
    });

    await User.findByIdAndUpdate(otherUserId, {
      $pull: {
        connection: myId,
      },
    });

    // ==================================================
    // SOCKET.IO
    // ==================================================

    const receiverSocketId = userSocketMap.get(
      otherUserId.toString(),
    );

    const senderSocketId = userSocketMap.get(
      myId.toString(),
    );

    // Notify other user
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("statusUpdate", {
        updatedUserId: myId.toString(),
        newStatus: "connect",
      });
    }

    // Notify current user
    if (senderSocketId) {
      io.to(senderSocketId).emit("statusUpdate", {
        updatedUserId: otherUserId.toString(),
        newStatus: "connect",
      });
    }

    return res.status(200).json({
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Remove connection error:", error);

    return res.status(500).json({
      message: `Remove connection error: ${error.message}`,
    });
  }
};

// ======================================================
// GET CONNECTION REQUESTS
// ======================================================

export const getConnectionRequest = async (req, res) => {
  try {
    const userId = req.userId;

    const requests = await Connection.find({
      receiver: userId,
      status: "pending",
    }).populate(
      "sender",
      "firstName lastName email userName profileImage headline",
    );

    return res.status(200).json(requests);
  } catch (error) {
    console.error(
      "Error in getConnectionRequests controller:",
      error,
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================================
// GET USER CONNECTIONS
// ======================================================

export const getUserConnections = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate(
      "connection",
      "firstName lastName userName profileImage headline",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user.connection);
  } catch (error) {
    console.error(
      "Error in getUserConnections controller:",
      error,
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};