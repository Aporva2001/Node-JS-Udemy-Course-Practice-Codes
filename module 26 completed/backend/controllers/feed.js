const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator/check");
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
    .populate('creator')
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Posts fetched successfully",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
  // .catch(err => {
  //   if(!err.statusCode){
  //     err.statusCode = 500;
  //   }
  //   next(err);
  // })
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  console.log(title, content);
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl, //const imageUrl = req.file.path.replace("\\" ,"/");
    creator: req.userId,
  });
  try {
    await post.save();
    //Now we will not send the post immediately instead we will update the post array for the users
    // console.log(result)
    const user = await User.findById(req.userId);

    user.posts.push(post);

    await user.save();

    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try{
  const post = await Post.findById(postId)

      if (!post) {
        const error = new Error("Could not find the post");
        error.statusCode = 404;

        throw error; // The error which is thrown here, inside the then block will be catched in the upcoming catch block and from there it will be passed to the next()
      }
      res.status(200).json({ message: "Post fetched", post: post });
    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;

  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }

  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }
  try{
  const post = await Post.findById(postId)
      if (!post) {
        const error = new Error("Could not find the post");
        error.statusCode = 404;

        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        // console.log(post.creator.toString(), req.userId);
        const error = new Error("User not authorized");
        error.statusCode = 403; // Status code for authorization
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      const result = await post.save();
      res
        .status(200)
        .json({ message: "Post Updated Successfully", post: result });
    }
    catch(err){
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const post= await Post.findById(postId)

      if (!post) {
        const error = new Error("Could not find the post");
        error.statusCode = 404;

        throw error;
      }
      if (post.creator.toString() !== req.userId) {
        // console.log(post.creator.toString(), req.userId);
        const error = new Error("User not authorized");
        error.statusCode = 403; // Status code for authorization
        throw error;
      }
      try{
      // Check logged in user.
      clearImage(post.imageUrl);
      await Post.findByIdAndDelete(postId);

      const user= await User.findById(req.userId);

      user.posts.pull(postId); // This is used to delete the post from the user collection to break the connection between users and posts.
      await user.save();
      
      res.status(200).json({ message: "Deleted Post" });
      }
      catch(err){
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
};
const clearImage = (filePath) => {
  // This function will be used to delete the image.
  filePath = path.join(__dirname, "../", filePath);
  fs.unlink(filePath, (err) => {
    console.log(err);
  });
};
