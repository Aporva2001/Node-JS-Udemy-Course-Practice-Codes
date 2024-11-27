const express= require('express');

const User= require('../models/user');

const {body} = require('express-validator/check')
const authController= require('../controllers/auth')
const isAuth= require('../middleware/is-auth')

const router= express.Router();

router.put('/signup',[
    body('email','Please enter a valid email')
      .isEmail()
      .normalizeEmail()
//       .custom((value, { req }) => {
//         // if (value === "test@test.com") {
//         //   throw new Error("This email address is forbidden");
//         // }
//         // return true;
//         return User.findOne({email: value})
//     .then((userDoc)=>{
//     if(userDoc){ // This will execute if the user already exists.
//         return Promise.reject('Email already exists') // This will be executed in case of any error.
//     }
//     })
//     }
// )
,
    body('password')
      .trim()
      .isLength({ min: 5 }),
    body('name')
      .trim()
      .not()
      .isEmpty()
  ], authController.signup)


router.post('/login', authController.login)

router.get('/status',isAuth,authController.getUserStatus)

router.patch('/status', isAuth,[
  body('status','Status cannot be empty!').trim().not().isEmpty()
], authController.updateUserStatus)

module.exports= router;