import { response } from "express";
import uploadOnCloudinary from "../config/cloudinary.js";
import Post from "../models/post.model.js";
import { io } from "../index.js";
import Notification from "../models/notification.model.js";

// ======================================================
// CREATE POST
// ======================================================

export const createPost = async (req, res) => {
  try {
    const { description } = req.body;

    let newPost;

    // ==================================================
    // If user uploaded an image
    // ==================================================
    if (req.file) {
      const image = await uploadOnCloudinary(req.file.path);
      newPost = await Post.create({
        author: req.userId,
        description,
        image,
      });
      // ==================================================
      // If user did NOT upload an image
      // ==================================================
    } else {
      newPost = await Post.create({
        author: req.userId,
        description,
      });
    }
    return res.status(201).json(newPost);
  } catch (error) {
    return res.status(500).json({
      message: `Create post error: ${error.message}`,
    });
  }
};

// ======================================================
// GET ALL POSTS
// ======================================================

export const getPost = async (req, res) => {
  try {
    const post = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "firstName userName lastName profileImage headline")
      .populate("comment.user", "firstName  lastName profileImage headline");

    return res.status(200).json(post);
  } catch (error) {
    console.log("GET POST ERROR:", error);

    return res.status(500).json({
      message: `Get Post error: ${error.message}`,
    });
  }
};

// ======================================================
// Like
// ======================================================

export const like = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }
    if (post.like.includes(userId)) {
      post.like = post.like.filter((id) => id != userId);
    } else {
      post.like.push(userId);

      // Create notification for the post owner
      // Do not notify the user if they like their own post
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          receiver: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: post._id,
        });
      }
    }

    // emit the like event
    io.emit("likeUpdated", { postId, likes: post.like });

    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: `Like error ${error}` });
  }
};
// ======================================================
// Comment
// ======================================================
export const comment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comment: {
            content: content,
            user: userId,
          },
        },
      },
      { new: true },
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    // Populate the user who made the comment
    await post.populate(
      "comment.user",
      "firstName lastName profileImage headline",
    );

    // notification
    if (post.author.toString() !== userId.toString()) {
      await Notification.create({
        receiver: post.author,
        type: "comment",
        relatedUser: userId,
        relatedPost: post._id,
        message: content.trim(),
      });
    }

    // console.log("COMMENT DATA:", post.comment);

    // emiting the comment event
    io.emit("commentAdded", { postId, comm: post.comment });

    return res.status(200).json(post);
  } catch (error) {
    console.log("COMMENT ERROR:", error);

    return res.status(500).json({
      message: `Comment error: ${error.message}`,
    });
  }
};
