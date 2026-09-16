import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/Nav";
import dp from "../assets/dp.png";
import { authDataContext } from "../context/AuthContext";
import { RxCross1 } from "react-icons/rx";


const Notification = () => {
  const { serverUrl } = useContext(authDataContext);

  const [notificationData, setNotificationData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // GET NOTIFICATIONS
  // ================================
  const handleGetNotification = async () => {
    try {
      setLoading(true);

      const result = await axios.get(
        `${serverUrl}/api/notification/get`,
        {
          withCredentials: true,
        }
      );

      console.log("NOTIFICATION DATA:", result.data);

      setNotificationData(result.data);
    } catch (error) {
      console.log(
        "Get notification error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // DELETE ONE NOTIFICATION
  // ================================
  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(
        `${serverUrl}/api/notification/deleteone/${id}`,
        {
          withCredentials: true,
        }
      );

      setNotificationData((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.log(
        "Delete notification error:",
        error.response?.data || error.message
      );
    }
  };

  // ================================
  // CLEAR ALL NOTIFICATIONS
  // ================================
  const handleClearAll = async () => {
    try {
      await axios.delete(
        `${serverUrl}/api/notification`,
        {
          withCredentials: true,
        }
      );

      setNotificationData([]);
    } catch (error) {
      console.log(
        "Clear notification error:",
        error.response?.data || error.message
      );
    }
  };

  // ================================
  // TIME FORMAT
  // ================================
  const getTime = (date) => {
    const now = new Date();
    const notificationTime = new Date(date);

    const difference = Math.floor(
      (now - notificationTime) / 1000
    );

    if (difference < 60) {
      return "Just now";
    }

    const minutes = Math.floor(difference / 60);

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d`;
    }

    return notificationTime.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  // ================================
  // NOTIFICATION TEXT
  // ================================
  const getNotificationText = (notification) => {
    const user = notification.relatedUser;

    const name = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "Someone";

    if (notification.type === "like") {
      return (
        <>
          <span className="font-semibold text-gray-900">
            {name}
          </span>{" "}
          liked your post
        </>
      );
    }

    if (notification.type === "comment") {
      return (
        <>
          <span className="font-semibold text-gray-900">
            {name}
          </span>{" "}
          commented on your post
        </>
      );
    }

    if (notification.type === "connectionAccepted") {
      return (
        <>
          <span className="font-semibold text-gray-900">
            {name}
          </span>{" "}
          accepted your connection request
        </>
      );
    }

    return null;
  };

  // ================================
  // GET DATA WHEN PAGE LOADS
  // ================================
  useEffect(() => {
    handleGetNotification();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f2ee]">

      {/* NAVBAR */}
      <Nav />

      {/* MAIN CONTAINER */}
      <div className="max-w-[700px] mx-auto pt-24 pb-10 px-3">

        {/* ================================
            HEADER
        ================================= */}
        <div className="bg-white rounded-lg border border-gray-200 px-5 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Notifications
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {notificationData.length === 0
                ? "No notifications"
                : `${notificationData.length} notification${
                    notificationData.length > 1 ? "s" : ""
                  }`}
            </p>
          </div>

          {notificationData.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              title="clear all notification"
            >
              Clear all
            </button>
          )}
        </div>

        {/* ================================
            LOADING
        ================================= */}
        {loading && (
          <div className="bg-white mt-3 rounded-lg border border-gray-200">
            <div className="p-5 text-center text-gray-500">
              Loading notifications...
            </div>
          </div>
        )}

        {/* ================================
            NO NOTIFICATIONS
        ================================= */}
        {!loading && notificationData.length === 0 && (
          <div className="bg-white mt-3 rounded-lg border border-gray-200 p-10 text-center">

            <div className="text-4xl mb-3">
              🔔
            </div>

            <h2 className="font-semibold text-gray-800">
              No notifications yet
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              When someone interacts with you,
              you'll see it here.
            </p>

          </div>
        )}

        {/* ================================
            NOTIFICATION LIST
        ================================= */}
        {!loading && notificationData.length > 0 && (
          <div className="bg-white mt-3 rounded-lg border border-gray-200 overflow-hidden">

            {notificationData.map((notification) => (

              <div
                key={notification._id}
                className="group flex items-center gap-3 px-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition"
              >

                {/* ================================
                    LEFT - USER PROFILE IMAGE
                ================================= */}
                <img
                  src={
                    notification.relatedUser?.profileImage ||
                    dp
                  }
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />

                {/* ================================
                    MIDDLE - NOTIFICATION CONTENT
                ================================= */}
                <div className="flex-1 min-w-0">

                  {/* Notification text */}
                  <p className="text-[15px] text-gray-700 leading-5">
                    {getNotificationText(notification)}
                  </p>

                  {/* Comment text */}
                  {notification.type === "comment" &&
                    notification.message && (
                      <p className="text-sm text-gray-600 mt-1 break-words">
                        "{notification.message}"
                      </p>
                    )}

                  {/* Time */}
                  <p className="text-xs text-gray-400 mt-1">
                    {getTime(notification.createdAt)}
                  </p>

                </div>

                {/* ================================
                    RIGHT - RELATED POST IMAGE
                ================================= */}
                {notification.relatedPost?.image && (
                  <img
                    src={notification.relatedPost.image}
                    alt="post"
                    className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                  />
                )}

                {/* ================================
                    DELETE BUTTON
                ================================= */}
                <button
                  onClick={() =>
                    handleDeleteNotification(
                      notification._id
                    )
                  }
                  className="text-gray-400 hover:text-red-500 transition text-xl ml-1 cursor-pointer flex-shrink-0"
                  title="Delete notification"
                >
                  <RxCross1 className="w-[20px] h-[20px] text-gray-700 font-bold" />
                </button>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
};

export default Notification;