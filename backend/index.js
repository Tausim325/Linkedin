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
import notificationRouter from "./routes/notification.routes.js"

dotenv.config();

let app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "https://linkedin-frontend-kjz5.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

let server = http.createServer(app)

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  }
});

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

let port = process.env.PORT || 8000
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/post", postRouter);
app.use("/api/connection", connectionRouter);
app.use("/api/notification", notificationRouter)

export const userSocketMap = new Map()

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("register", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(userSocketMap);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected:", socket.id);
    for (const [userId, id] of userSocketMap) {
      if (id === socket.id) userSocketMap.delete(userId);
    }
  });
});

server.listen(port, () => {
  connectDb();
  console.log("server started");
});
