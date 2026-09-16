import express from "express"
import { acceptConnection, getConnectionRequest, getConnectionStatus, getUserConnections, rejectConnection, removeConnection, sendConnection } from "../controllers/connection.controller.js"
import isAuth from "../middlewares/isAuth.js"


const connectionRouter = express.Router()

// send connection route
connectionRouter.post("/send/:id",isAuth,sendConnection)

// accept connection route
connectionRouter.put("/accept/:connectionId",isAuth,acceptConnection)

// reject connection route
connectionRouter.put("/reject/:connectionId",isAuth,rejectConnection)

// get connection route
connectionRouter.get("/status/:userId", isAuth, getConnectionStatus);

// remove connection route 
connectionRouter.delete("/remove/:userId",isAuth,removeConnection)

// user request route
connectionRouter.get("/requests",isAuth,getConnectionRequest)

// all connections 
connectionRouter.get("/",isAuth,getUserConnections)

export default connectionRouter