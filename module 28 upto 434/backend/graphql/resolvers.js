const bcrypt= require('bcryptjs')
const validator= require('validator');
const jwt= require('jsonwebtoken')
const User= require('../models/user')
const Post= require('../models/post')

// We need a method for every query or mutation or query we define in our schema.
module.exports = {
  createUser: async function ({ userInput }, req) { // args is an object which contains all the arguments in the form of objects
    // const email= userInput.email;                            // const email= args.userInput.email;
    const errors= [];
    if(!validator.isEmail(userInput.email)){
        errors.push({message: 'Email is invalid'})
    }
    if(validator.isEmpty(userInput.password) || !(validator.isLength(userInput.password, {min: 5}))){
        errors.push({message: 'Password too short!'})
    }

    if(errors.length > 0){
        const error= new Error('Invalid Input');
        error.data= errors;
        error.code= 422; //Status codes are not set in graphql, here we have set them for our own understanding. 
        throw error;
    }
    const existingUser= await User.findOne({email: userInput.email});

    if(existingUser){
        const error= new Error('User already exists!');
        throw error;
    }
    const hashedPw= await bcrypt.hash(userInput.password, 12);

    const user= new User({
        email: userInput.email,
        name: userInput.name,
        password: hashedPw
    });

    const createdUser= await user.save();

    return {...createdUser._doc, _id: createdUser._id.toString()} // _doc property returns all data which is there in the mongodb document without metadata.
    // we need to override the existing user id which is in the form of object in the database with the type of string.
},

login:async function({email, password}) {
    const user= await User.findOne({email: email})
    if(!user){
        const error= new Error('User not Found!');
        error.code= 401;
        throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);

    if(!isEqual){
        const error= new Error('Invalid Password');
        error.code=401;
        throw error;
    }

    const token= jwt.sign({
        userId:user._id.toString(),
        email: user.email
    }, 'somesupersecretsecret', {expiresIn: '1h'})

    return {token: token, userId: user._id.toString()}
},

createPost: async function({postInput}, req) {
    if(!req.isAuth){
        const error= new Error('Not Authenticated!');
        error.code=401;
        throw error;
    }
    const errors= [];
    if(validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {min: 5})){
        errors.push({message: 'Title is too short!'})
    }
    if(validator.isEmpty(postInput.content) || !validator.isLength(postInput.content,{min: 5})){
        errors.push({message: 'Content is too short!'})
    }
    if(errors.length > 0){
        const error= new Error('Invalid Input');
        error.data= errors;
        error.code= 422; //Status codes are not set in graphql, here we have set them for our own understanding. 
        throw error;
    }
    const user= await User.findById(req.userId);

    if(!user){
        const error= new Error('Invalid User');
        error.data= errors;
        error.code= 401; //Status codes are not set in graphql, here we have set them for our own understanding. 
        throw error;
    }
    const post = new Post({
        title: postInput.title,
        content: postInput.content,
        imageUrl: postInput.imageUrl,
        creator: user
    })

    const createdPost= await post.save();
    user.posts.push(createdPost)
    await user.save()
    return {...createdPost._doc, _id: createdPost._id.toString(), createdAt: createdPost.createdAt.toISOString(), updatedAt: createdPost.updatedAt.toISOString()}
}
}

// hello(){
//     return{
//         text: 'Hello World',
//         views: 12345
//     }
// }