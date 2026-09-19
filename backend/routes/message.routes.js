import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const messageRouter = express.Router();

// upload.single("image") reads an optional image file from the request
// before sendMessage runs — same pattern as postRouter's "/create" route.
messageRouter.post("/send/:receiverId", isAuth, upload.single("image"), sendMessage);

// get the full conversation history with one other user
messageRouter.get("/:otherUserId", isAuth, getMessages);

export default messageRouter;
