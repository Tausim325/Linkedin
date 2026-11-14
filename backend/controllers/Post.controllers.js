import Post from "../models/post.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import { io } from "../index.js";
import Notification from "../models/notification.model.js"

export const createPost = async (req, res) => {
  try {
    let { description } = req.body
    let newPost;
    if (req.file) {
      let image = await uploadOnCloudinary(req.file.path)
      newPost = await Post.create({
        author: req.userId,
        description,
        image
      })
    } else {
      newPost = await Post.create({
        author: req.userId,
        description
      })
    }

    return res.status(201).json(newPost)
  } catch (error) {
    return res.status(500).json(`create post error ${error}`)
  }
}

export const getpost = async (req, res) => {
  try {
    const post = await Post.find()
      .populate("author", "firstName lastName userName profileImage headline")
      .populate("comment.user", "firstName lastName userName profileImage headline")
      .sort({ createdAt: -1 });
    return res.status(200).json(post)
  } catch (error) {
    return res.status(500).json({ message: "getpost error" })
  }
}

// likes
export const like = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.like.some(id => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.like = post.like.filter(id => id.toString() !== userId.toString());
    } else {
      post.like.push(userId);

      // Notify the post author (not for my own post, no duplicates)
      if (post.author.toString() !== userId.toString()) {
        const exists = await Notification.findOne({
          receiver: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });
        if (!exists) {
          await Notification.create({
            receiver: post.author,
            type: "like",
            relatedUser: userId,
            relatedPost: postId,
          });
        }
      }
    }

    await post.save();
    io.emit("likeUpdated", { postId, likes: post.like });

    // populate so the frontend gets full author info back
    await post.populate("author", "firstName lastName userName profileImage headline");

    return res.status(200).json(post);
  } catch (error) {
    console.error("like error:", error);
    return res.status(500).json({ message: `like error ${error.message}` });
  }
};

// comment
export const comment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comment: { content: content.trim(), user: userId } } },
      { returnDocument: "after" }
    )
      .populate("author", "firstName lastName userName profileImage headline")
      .populate("comment.user", "firstName lastName userName profileImage headline");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Notify the post author (not for my own post)
    if (post.author._id.toString() !== userId.toString()) {
      await Notification.create({
        receiver: post.author._id,
        type: "comment",
        relatedUser: userId,
        relatedPost: postId,
      });
    }

    io.emit("commentUpdated", { postId, comments: post.comment });

    return res.status(200).json(post);
  } catch (error) {
    console.error("comment error:", error);
    return res.status(500).json({ message: `comment error ${error.message}` });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const target = post.comment.id(commentId);
    if (!target) return res.status(404).json({ message: "Comment not found" });

    // Only the comment owner or the post author can delete it
    const isOwner = target.user.toString() === userId.toString();
    const isPostAuthor = post.author.toString() === userId.toString();
    if (!isOwner && !isPostAuthor) {
      return res.status(403).json({ message: "Not allowed" });
    }

    target.deleteOne();
    await post.save();

    await post.populate("author", "firstName lastName userName profileImage headline");
    await post.populate("comment.user", "firstName lastName userName profileImage headline");
    io.emit("commentUpdated", { postId, comments: post.comment });

    return res.status(200).json(post);
  } catch (error) {
    console.log("deleteComment error:", error);
    return res.status(500).json({ message: `deleteComment error ${error.message}` });
  }
};

// Delete my own post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only the author can delete
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Post.findByIdAndDelete(id);
    await Notification.deleteMany({ relatedPost: id });

    return res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.log("deletePost error:", error);
    return res.status(500).json({ message: `deletePost error ${error.message}` });
  }
};
