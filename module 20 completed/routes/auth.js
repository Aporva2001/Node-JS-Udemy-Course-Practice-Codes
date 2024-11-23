const express = require("express");
const { check, body } = require("express-validator/check"); // check is the subpackage used for all the validation logic. {check} is a function.

// check function returns a middleware.
// body is to validate a field which is in the request body.

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", 
    [
        body('email').isEmail().withMessage('Please enter a valid Email').normalizeEmail(),      
        body('password','Please enter a valid password').isLength({min: 5}).isAlphanumeric().trim()
    ],
    authController.postLogin);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid Email")
      .normalizeEmail()
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This email address is forbidden");
        // }
        // return true;
        return User.findOne({email: value})
    .then((userDoc)=>{
    if(userDoc){ // This will execute if the user already exists.
        return Promise.reject('Email already exists') // This will be executed in case of any error.
    }
    })
    }),
    body(
      "password",
      "Please enter a password of atleast 5 characters and use only numbers and alphabets."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),

    body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }

      return true;
    }),
  ],
  authController.postSignup
); // isEmail is a builtin function which checks the valid email address. The second argument will be used as the default error message for all the validators.

// withMessage function is used to give a custom message to the error while valildation.

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
