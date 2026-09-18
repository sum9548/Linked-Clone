import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const messageRouter = express.Router();

// send a message to someone (isAuth checks the cookie/token first)
messageRouter.post("/send/:receiverId", isAuth, sendMessage);

// get the full conversation history with one other user
messageRouter.get("/:otherUserId", isAuth, getMessages);

export default messageRouter;