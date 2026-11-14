import express from "express"
import isAuth from "../middlewares/isAuth.js"
import upload from "../middlewares/Multer.js"
import { createPost, getpost, like, comment, deleteComment,deletePost } from "../controllers/Post.controllers.js"
const postRouter=express.Router()

postRouter.post("/create",isAuth,upload.single("image"),createPost)
postRouter.get("/getpost", isAuth,getpost )
postRouter.post("/like/:id", isAuth,like)
postRouter.post("/comment/:id", isAuth, comment);
postRouter.delete("/comment/:id/:commentId", isAuth, deleteComment)
postRouter.delete("/delete/:id", isAuth, deletePost)
export default postRouter
