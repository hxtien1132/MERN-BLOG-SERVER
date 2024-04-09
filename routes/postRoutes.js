const { Router } = require("express");
const asyncHandler = require("express-async-handler");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createPost,
  deletePost,
  getPosts,
  getCatPosts,
  getUserPosts,
  editPost,
  getPost,
} = require("../controller/postController");
const postRouter = Router();

postRouter.get("/:id", getPost);
postRouter.get("/", getPosts);
postRouter.post("/", authMiddleware, createPost);
postRouter.delete("/:id", authMiddleware, deletePost);
postRouter.get("/categories/:category", getCatPosts);
postRouter.get("/users/:id", getUserPosts);
postRouter.patch("/:id", authMiddleware, editPost);

module.exports = postRouter;
