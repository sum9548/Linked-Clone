import React, { useContext, useEffect, useState } from "react";
import axios from "axios"; // ✅ YOU WERE MISSING THIS
import { authDataContext } from "../context/AuthContext";
import io from "socket.io-client";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const socket = io("https://linked-backend-kned.onrender.com");

const ConnectionButton = ({ userId }) => {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);

  const navigate = useNavigate();

  const [status, setStatus] = useState("");

  // =========================
  // SEND CONNECTION
  // =========================
  const handleSendConnection = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/connection/send/${userId}`,
        {},
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      // Immediately change button
      setStatus("pending");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };
  // =========================
  // GET CONNECTION STATUS
  // =========================
  const handleGetStatus = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/connection/status/${userId}`,
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      setStatus(result.data.status);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // =========================
  // REMOVE CONNECTION
  // =========================
  const handleRemoveConnection = async () => {
    try {
      const result = await axios.delete(
        `${serverUrl}/api/connection/remove/${userId}`,
        {
          withCredentials: true,
        },
      );

      console.log(result.data);

      // Update UI immediately
      setStatus("connect");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // =========================
  // SOCKET
  // =========================
  useEffect(() => {
    if (!userData?._id) return;

    socket.emit("register", userData._id);

    handleGetStatus();

    const handleStatusUpdate = ({ updatedUserId, newStatus }) => {
      if (updatedUserId.toString() === userId.toString()) {
        setStatus(newStatus);
      }
    };

    socket.on("statusUpdate", handleStatusUpdate);

    return () => {
      socket.off("statusUpdate", handleStatusUpdate);
    };
  }, [userId, userData?._id]);

  // =========================
  // BUTTON CLICK
  // =========================
  const handleClick = async () => {
    if (status === "connected") {
      await handleRemoveConnection();
    } else if (status === "received") {
      navigate("/network");
    } else {
      await handleSendConnection();
    }
  };

  ////////////////////
  // useEffect(() => {
  //   console.log("STATUS CHANGED:", status);
  // }, [status]);
  /////////////////////
  return (
    <div>
      <button
        onClick={handleClick}
        disabled={status === "pending"}
        className={`min-w-[100px] h-10 rounded-full border-2 border-blue-500 text-blue-500
    ${
      status === "pending"
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-blue-50 cursor-pointer"
    }
  `}
      >
        {status}
      </button>
    </div>
  );
};

export default ConnectionButton;
