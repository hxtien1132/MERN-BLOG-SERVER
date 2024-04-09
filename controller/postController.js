const asyncHandler = require("express-async-handler");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");
const Post = require("../models/postModel");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const path = require("path");
const fs = require("fs");
const { error } = require("console");
const { response } = require("express");
// Create a new post
const createPost = asyncHandler(async (req, res, next) => {
  try {
    let { title, category, description } = req.body;
    // console.log(req.body);
    if (!title || !category || !description || !req.files) {
      next(new HttpError("Fill in all fields and choose thumbnail"));
    }
    if (req.files) {
      const { thumbnail } = req.files;
      if (thumbnail.size > 2000000) {
        throw new HttpError("Thumbnail too big. File should be less than 2mb");
      }

      let filename = thumbnail.name;
      let splitedFilename = filename.split(".");
      let newFilename =
        splitedFilename[0] + uuid() + "." + splitedFilename[splitedFilename.length - 1];
      // console.log("file save:", path.join(__dirname, "..", "/uploads", newFilename));
      //upload new thumbnail
      thumbnail.mv(path.join(__dirname, "..", "/uploads", newFilename), async (err) => {
        if (err) {
          throw new HttpError(err);
        } else {
          const newPost = await Post.create({
            title: title,
            category: category,
            description: description,
            thumbnail: newFilename,
            creator: req.user.id,
          });
          if (!newPost) throw new HttpError("Post could not be created", 422);
          // find user and increase post count + 1
          const currentUser = await User.findById(req.user.id);
          const userPostCount = currentUser.posts + 1;
          await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
          res.status(200).json(newPost);
        }
      });
    }
  } catch (error) {
    next(new HttpError(error));
  }
});
//get post id
// GET: api/posts/:id
const getPost = asyncHandler(async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      throw new HttpError("Post not found", 404);
    }
    res.status(200).json(post);
  } catch (error) {
    next(new HttpError(error));
  }
});
// get posts
// GET: api/posts
const getPosts = asyncHandler(async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    next(new HttpError(error));
  }
});
// get posts by category
// GET: api/posts/categories/:category
const getCatPosts = asyncHandler(async (req, res, next) => {
  const category = req.params.category;
  const posts = await Post.find({ category }).sort({ updateAt: -1 });
  res.status(200).json(posts);
});
// get author post
// GET: api/posts/categories/:category
const getUserPosts = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.params.id;
    const posts = await Post.find({ creator: userId }).sort({ updateAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    next(new HttpError(error));
  }
});
// edit post
// PATCH: api/posts/:id
const editPost = asyncHandler(async (req, res, next) => {
  try {
    let filename;
    let newFilename;
    let updatePost;
    const postId = req.params.id;
    let { title, category, description } = req.body;
    if (!title || !category || !description) {
      throw new HttpError("fill in all fields", 422);
    }
    // console.log(req.files);
    const oldPost = await Post.findById(postId);
    if (req.user.id == oldPost.creator) {
      if (!req.files) {
        updatePost = await Post.findByIdAndUpdate(
          postId,
          { title, category, description },
          { new: true }
        );
      } else {
        //delete old thumbnail from folder uploads
        fs.unlink(
          path.join(__dirname, "..", "uploads", oldPost.thumbnail),
          async (err) => {
            if (err) {
              throw new HttpError(err);
            }
          }
        );
        //upload new thumbnail
        //check if thumbnail
        const { thumbnail } = req.files;
        if (thumbnail.size > 2000000) {
          throw new HttpError("Thumbnail too big. File should be less than 2mb");
        }
        filename = thumbnail.name;
        let splitedFilename = filename.split(".");
        newFilename =
          splitedFilename[0] + uuid() + "." + splitedFilename[splitedFilename.length - 1];
        thumbnail.mv(path.join(__dirname, "..", "/uploads", newFilename), async (err) => {
          if (err) {
            throw new HttpError(err);
          }
        });
        updatePost = await Post.findByIdAndUpdate(
          postId,
          {
            title,
            category,
            description,
            thumbnail: newFilename,
          },
          { new: true }
        );
      }
    }
    // console.log(updatePost);
    if (!updatePost) {
      throw new HttpError("couldn't update post", 400);
    }
    res.status(200).json(updatePost);
  } catch (error) {
    next(new HttpError(error));
  }
});

// DELETE POST
// DELETE: api/posts/:id
const deletePost = asyncHandler(async (req, res, next) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      throw new HttpError("post unvailable", 400);
    }
    const post = await Post.findById(postId);
    const filename = post.thumbnail;
    //delete thumbnail\
    if (post.creator == req.user.id) {
      fs.unlink(path.join(__dirname, "..", "uploads", filename), async (err) => {
        if (err) {
          throw new HttpError(err);
        } else {
          await Post.findByIdAndDelete(postId);
          //find user and decrease count by 1
          const currentUser = await User.findById(req.user.id);
          const userPostCount = currentUser?.posts - 1;
          await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
          res.status(200).json(`Post: ${postId} deleted successfully`);
        }
      });
    } else throw new HttpError("Post could't be deleted successfully", 403);
  } catch (error) {
    next(new HttpError(err));
  }
});
module.exports = {
  createPost,
  deletePost,
  getPosts,
  getCatPosts,
  getUserPosts,
  editPost,
  getPost,
};
