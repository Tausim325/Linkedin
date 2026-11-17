import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js";
import connectionRouter from "./routes/connection.routes.js"
import http from "http";
import { Server } from "socket.io";
//import NotificationRouter from "./routes/notification.route.js"
import notificationRouter from "./routes/notification.routes.js"
dotenv.config();
let app=express();

let server=  http.createServer(app)
export const io = new Server(server, {
  cors: {
    origin: [
      "https://linkedin-frontend-kjz5.onrender.com",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  }
});


app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: [
      "https://linkedin-frontend-kjz5.onrender.com",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);
let port=process.env.PORT || 8000
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/post", postRouter);
app.use("/api/connection", connectionRouter);
app.use("/api/notification", notificationRouter)
export const userSocketMap= new Map()

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  // Save which socket belongs to which user
  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);   // socket.id, not the whole socket
    console.log(userSocketMap);
  });

  // Remove the user from the map when they disconnect
  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
    for (const [userId, id] of userSocketMap) {
      if (id === socket.id) userSocketMap.delete(userId);
    }
  });
});   // <- connection callback yahan band hota hai

server.listen(port, ()=>{
connectDb();
console.log("server started");
});
