const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator/check");

const io= require('../socket')
const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
    .populate('creator')
    .sort({createdAt: -1}) // This does sorting by the createdAt field in the descending way.
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
    io.getIO().emit('posts',{action: 'create', post: {...post._doc, creator: {_id: req.userId, name: user.name}}}) // posts is the event name (channel name), then we will define the data we send.
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
  const post = await Post.findById(postId)
  try{

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
  const post = await Post.findById(postId).populate('creator')
      if (!post) {
        const error = new Error("Could not find the post");
        error.statusCode = 404;

        throw error;
      }

      if (post.creator._id.toString() !== req.userId) {
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
      io.getIO().emit('posts',{
        action: 'update',
        post: result
      })
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
      io.getIO().emit('posts',{action: 'delete', post: postId})
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
