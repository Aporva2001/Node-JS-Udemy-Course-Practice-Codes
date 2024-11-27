const { validationResult } = require('express-validator/check');
const User= require('../models/user');
const bcrypt= require('bcryptjs');
const jwt= require('jsonwebtoken')

exports.signup = async (req, res, next)=>{
    const errors= validationResult(req);
    if(!errors.isEmpty()){
        const error= new Error('Validation Failed');
        error.statusCode= 422;
        error.data= errors.array();
        console.log(error)

        throw error;
    }
    const email= req.body.email;
    const password= req.body.password;
    const name= req.body.name;
    try{

    const hashedPw= await bcrypt.hash(password,12)
        const user= new User({
            email: email,
            password: hashedPw,
            name: name
        })

    const result= await user.save()

        res.status(201).json({message: 'User created Successfully.',
            userId: result._id
        })
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.login = async (req, res, next)=>{
    const email= req.body.email;
    const password= req.body.password;
    let loadedUser;
    try{

    const user = await User.findOne({email: email})
        if(!user){
            const error= new Error('A user with this email not found.');
            error.statusCode=401; // 401 is for authentication failed.

            throw error;
        }

        loadedUser=user;
        const isEqual= await bcrypt.compare(password, user.password)

        if(!isEqual){
            const error= new Error('Invalid email/password!');
            error.statusCode=401;

            throw error;
        }
        const token= jwt.sign({email: loadedUser.email, userId: loadedUser._id.toString()},
        'somesupersecretsecret', // This is the secret key used to sign the token
    {expiresIn: '1h'});// This creates a new signature and packs it into jsonwebtoken.

    res.status(200).json({token: token, userId: loadedUser._id.toString()})
    }
    catch{
        if(!err.statusCode){
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.getUserStatus = async (req, res, next)=>{
    try{
    const user= await User.findById(req.userId)
        if(!user){
            const error= new Error('User not Found');
            error.statusCode=404;

            throw error;
        }
        res.status(200).json({status: user.status})
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.updateUserStatus= async (req, res, next)=>{
    const newStatus= req.body.status;
    try{
    const user= await User.findById(req.userId)

        if(!user){
            const error= new Error('User not Found');
            error.statusCode=404;

            throw error;
        }
        user.status=newStatus;

        await user.save();
        res.status(200).json({message: 'User Updated'})
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
          }
          next(err);
    }
}