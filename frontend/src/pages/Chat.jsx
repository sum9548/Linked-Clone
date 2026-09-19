import React, { useContext, useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import axios from "axios";
import io from "socket.io-client";
import dp from "../assets/dp.png";
import { IoArrowBack } from "react-icons/io5";
import { authDataContext } from "../context/AuthContext";
import { userDataContext } from "../context/UserContext";

// Same backend URL used everywhere else in the app (Post.jsx, ConnectionButton.jsx).
// Keeping ONE hardcoded value like this is what caused a bug before —
// double check this matches your real backend URL if you ever change it.
const socket = io("https://linked-backend-kned.onrender.com");

const Chat = () => {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);

  // The list of people you can chat with (your accepted connections)
  const [connections, setConnections] = useState([]);

  // Which connection you currently have open in the chat window
  const [activeChat, setActiveChat] = useState(null);

  // The messages for whichever conversation is currently open
  const [messages, setMessages] = useState([]);

  // What's currently typed in the input box
  const [text, setText] = useState("");

  // Used to auto-scroll to the newest message
  const bottomRef = useRef(null);

  // ==========================================================
  // 1. Load your connections list (the sidebar) once on mount
  // ==========================================================
  const loadConnections = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/connection`, {
        withCredentials: true,
      });
      setConnections(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  // ==========================================================
  // 2. Load message history whenever you open a different chat
  // ==========================================================
  const loadMessages = async (otherUserId) => {
    try {
      const result = await axios.get(`${serverUrl}/api/message/${otherUserId}`, {
        withCredentials: true,
      });
      setMessages(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const openChat = (connection) => {
    setActiveChat(connection);
    loadMessages(connection._id);
  };

  // ==========================================================
  // 3. Register this user's socket + listen for live messages
  // ==========================================================
  useEffect(() => {
    if (!userData?._id) return;

    // Tell the backend "this is my socket id" so it knows where to
    // push messages meant for me (same pattern as ConnectionButton.jsx).
    socket.emit("register", userData._id);

    const handleNewMessage = (message) => {
      // Only add it to the screen if it belongs to the chat you have open.
      // (message.sender is the populated user object, so we check its _id)
      const isForCurrentChat =
        activeChat &&
        (message.sender._id === activeChat._id ||
          message.receiver._id === activeChat._id);

      if (isForCurrentChat) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
    // Re-run when activeChat changes, so handleNewMessage always checks
    // against the CURRENT open chat, not a stale/old one.
  }, [userData, activeChat]);

  // ==========================================================
  // 4. Auto-scroll to the bottom whenever messages change
  // ==========================================================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ==========================================================
  // 5. Send a message
  // ==========================================================
  const handleSend = async () => {
    if (!text.trim() || !activeChat) return; // don't send empty messages

    try {
      const result = await axios.post(
        `${serverUrl}/api/message/send/${activeChat._id}`,
        { text },
        { withCredentials: true },
      );

      // Add my own sent message to the screen right away —
      // I don't need the socket for this since it's MY message.
      setMessages((prev) => [...prev, result.data]);
      setText("");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-screen h-[100vh] bg-[#f3f2ef] pt-[80px] flex">
      <Nav />

      {/* LEFT: connections sidebar.
          On small screens: full width, but HIDDEN once a chat is open.
          On md+ screens: fixed 300px width, ALWAYS visible. */}
      <div
        className={`${
          activeChat ? "hidden" : "flex"
        } md:flex flex-col w-full md:w-[300px] h-full bg-white border-r overflow-y-auto`}
      >
        {connections.map((connection) => (
          <div
            key={connection._id}
            onClick={() => openChat(connection)}
            className={`flex items-center gap-[10px] p-[15px] cursor-pointer hover:bg-gray-100 ${
              activeChat?._id === connection._id ? "bg-gray-100" : ""
            }`}
          >
            <img
              src={connection.profileImage || dp}
              className="w-[45px] h-[45px] rounded-full object-cover shrink-0"
            />
            {/* min-w-0 + truncate stop long names from wrapping/squishing */}
            <div className="min-w-0 truncate">
              {connection.firstName} {connection.lastName}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT: active conversation.
          On small screens: full width, but HIDDEN until a chat is open.
          On md+ screens: always visible next to the sidebar. */}
      <div
        className={`${
          activeChat ? "flex" : "hidden"
        } md:flex flex-1 flex-col`}
      >
        {activeChat ? (
          <>
            <div className="p-[15px] bg-white border-b font-semibold flex items-center gap-[10px]">
              {/* Back arrow only shows on small screens (md:hidden) —
                  tapping it just clears activeChat, which switches us
                  back to showing the sidebar instead of the chat. */}
              <IoArrowBack
                className="text-2xl cursor-pointer md:hidden"
                onClick={() => setActiveChat(null)}
              />
              <span className="truncate">
                {activeChat.firstName} {activeChat.lastName}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-[20px] flex flex-col gap-[10px]">
              {messages.map((message) => {
                const isMine = message.sender._id === userData._id;
                return (
                  <div
                    key={message._id}
                    className={`max-w-[75%] md:max-w-[60%] p-[10px] rounded-lg ${
                      isMine
                        ? "bg-blue-500 text-white self-end"
                        : "bg-white self-start"
                    }`}
                  >
                    {message.text}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-[15px] bg-white border-t flex gap-[10px]">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 min-w-0 border rounded-full px-[15px] py-[8px] outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-blue-500 text-white px-[20px] rounded-full shrink-0"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 items-center justify-center text-gray-500 hidden md:flex">
            Select a connection to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
