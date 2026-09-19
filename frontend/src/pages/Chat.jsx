import React, { useContext, useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import axios from "axios";
import io from "socket.io-client";
import dp from "../assets/dp.png";
import { IoArrowBack } from "react-icons/io5";
import { BsImage, BsSendFill } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
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

  // The actual image FILE, ready to upload to the backend
  const [backendImage, setBackendImage] = useState(null);

  // A local preview URL so YOU can see the image before sending it
  // (this is NOT the uploaded version — just a temporary browser-only preview)
  const [frontendImage, setFrontendImage] = useState("");

  // A hidden <input type="file"> is triggered by clicking a visible icon —
  // this ref lets our icon's onClick "remote control" that hidden input.
  const fileInputRef = useRef(null);

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
  // 5. Pick an image from your gallery/files
  // ==========================================================
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackendImage(file); // the real file, saved for upload later
    setFrontendImage(URL.createObjectURL(file)); // a temporary preview link
  };

  const removeSelectedImage = () => {
    setBackendImage(null);
    setFrontendImage("");
  };

  // ==========================================================
  // 6. Send a message (text, image, or both)
  // ==========================================================
  const handleSend = async () => {
    // Don't send a truly empty message (no text AND no image)
    if (!text.trim() && !backendImage) return;
    if (!activeChat) return;

    try {
      // FormData is required whenever you're sending a file — you can't
      // send a File object as plain JSON like you can with text.
      const formData = new FormData();
      formData.append("text", text);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/message/send/${activeChat._id}`,
        formData,
        { withCredentials: true },
      );

      // Add my own sent message to the screen right away —
      // I don't need the socket for this since it's MY message.
      setMessages((prev) => [...prev, result.data]);
      setText("");
      removeSelectedImage();
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
                    {/* Show the image if this message has one */}
                    {message.image && (
                      <img
                        src={message.image}
                        className="max-w-full rounded-md mb-[6px]"
                      />
                    )}
                    {/* Only render the text line if there IS text —
                        an image-only message shouldn't show an empty line */}
                    {message.text && <div>{message.text}</div>}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Preview of the image you picked, before you hit Send */}
            {frontendImage && (
              <div className="p-[10px] bg-white border-t flex items-center gap-[10px]">
                <img
                  src={frontendImage}
                  className="w-[60px] h-[60px] object-cover rounded-md"
                />
                <RxCross1
                  className="cursor-pointer text-gray-500"
                  onClick={removeSelectedImage}
                />
              </div>
            )}

                        <div className="p-[15px] bg-white border-t flex gap-[10px] items-center">
              {/* Same "relative" trick as before, but now the icon is
                  pinned to the RIGHT edge instead of the left. */}
              <div className="flex-1 min-w-0 relative">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  hidden
                  onChange={handleImageSelect}
                />

                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Type a message..."
                  // pr-[42px] (padding-RIGHT) leaves room on the right side
                  // now, since that's where the icon sits.
                  className="w-full border rounded-full pl-[15px] pr-[42px] py-[8px] outline-none"
                />

                {/* Positioned absolutely INSIDE the input's right side */}
                <BsImage
                  className="absolute right-[14px] top-1/2 -translate-y-1/2 text-xl text-gray-500 cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                />
              </div>

              <button
                onClick={handleSend}
                className="bg-blue-500 text-white w-[42px] h-[42px] rounded-full shrink-0 flex items-center justify-center"
              >
                <BsSendFill className="text-lg" />
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
