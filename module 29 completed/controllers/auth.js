const crypto= require('crypto') // This is the package which helps us with the creation of unique,random values

const bcrypt= require('bcryptjs')
const nodemailer= require('nodemailer')
const sendgridTransport= require('nodemailer-sendgrid-transport')
const User = require('../models/user');

const {validationResult} = require('express-validator/check') // validationResult gathers all the errors which are thrown by the check function in the router file.
//Here we need to define how our mails will be delivered.
const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key: `${process.env.SENDMAILER_KEY}`
  }
}))
// sendgridTransport() returns a configuration which the nodemailer uses to use sendgrid.

exports.getSignup = (req, res, next) => {
  let message= req.flash('error');
  if(message.length > 0){
    message=message[0];
  }
  else
  message=null;
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {email: "", password: "", confirmPassword: ""},
    validationErrors: []
    // isAuthenticated: false
  });
};

exports.postSignup = (req, res, next) => {
  const email= req.body.email;
  const password= req.body.password;
  const confirmPassword= req.body.confirmPassword;
  // Now we will look if the user already exists in the database.
  const errors= validationResult(req) // This will store all the errors in the variable.

  if(!errors.isEmpty()){
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password, confirmPassword},
      validationErrors: errors.array()
      // isAuthenticated: false
    });
  }
  bcrypt.hash(password,12) // Number 12 defines how many rounds of hashing we want to apply, it is directly proportional to the security.
    .then(hashedPassword =>{
      const user= new User({
        email: email,
        password: hashedPassword,
        cart: {items: []}
      });
      return user.save();
    })

  .then(result =>{
    res.redirect('/login')
    return transporter.sendMail({
      to: email,
      from: 'aporvagoyal065@gmail.com',
      subject: 'Signedup Succeeded For E-Commerce App Node JS',
      html: '<h1>You have successfully signedup!</h1>'
    })

    .catch(err => {
      const error= new Error(err);
      error.httpStatusCode=500;
      return next(error)
    });
  })

};

exports.getLogin = (req, res, next) => {
  let message= req.flash('error');
  if(message.length > 0){
    message=message[0];
  }
  else
  message=null;
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput:{email: '', password: ''},
    validationErrors: []
    //  req.flash('error') // This information is removed from the session after being passed to the corressponding view.
    // isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  const email= req.body.email;
  const password= req.body.password;
  const errors= validationResult(req);

  if(!errors.isEmpty()){
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password},
      validationErrors: errors.array()
      // isAuthenticated: false
    });
  }
  User.findOne({email: email})
    .then(user => {

      if(!user){
        // req.flash('error','Invalid Email or Password') // this takes a key and value.

      return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: 'Invalid Email or Password',
      oldInput: {email: email, password: password},
      validationErrors: []
      // isAuthenticated: false
    });
      }
      bcrypt.compare(password,user.password) // In this we face an error if something goes wrong in the code not in case of password mismatch
      .then(doMatch =>{
        // Here we will handle both the matching and mismatching of the passwords.
        if(doMatch){
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err)=>{ // This is an async method so the callback should be returned, otherwise redirection to login route will take place.
            console.log(err);
            return res.redirect('/');
      })
        }
        // If the passwords do not match then we will redirect to the login page.
        // req.flash('error','Invalid Email or Password')
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid Email or Password',
          oldInput: {email: email, password: password},
          validationErrors: []
          // isAuthenticated: false
        });
      })
      .catch(err =>{
        console.log(err);
        res.redirect('/login');
      })
    })
    .catch(err => {
      const error= new Error(err);
      error.httpStatusCode=500;
      return next(error)
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err)=>{
    console.log(err);
    res.redirect('/');
  });

};

exports.getReset= (req, res, next)=>{
  let message= req.flash('error');
  if(message.length > 0){
    message=message[0];
  }
  else
  message=null;
  res.render('auth/reset',{
    path:'/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
}

exports.postReset = (req, res, next)=>{
  crypto.randomBytes(32, (err, buffer)=>{
    if(err){
      console.log(err);
      return res.redirect('/reset');
    }
    // Buffer contains the generated random value.
    const token= buffer.toString('hex') // hex is written here to convert the hex values to normal ascii characters.
    // This token belongs to our user so we will pass it to user model.
    User.findOne({email: req.body.email})
    .then(user =>{
      if(!user){
      req.flash('error','No Account with the Email Found')
      return res.redirect('/reset');
      }
      user.resetToken= token;
      user.resetTokenExpiration= Date.now() + 3600000;
      return user.save();
    })
    .then(result =>{
      res.redirect('/');
      transporter.sendMail({
        to: req.body.email,
        from: 'aporvagoyal065@gmail.com',
        subject: 'Reset Password For E-Commerce App Node JS',
        html: `
        <p>You requested for a password reset</p>
        <p>Click this <a href = "https://ecommerce-app-node-7pfw.onrender.com/reset/${token}">link</a> to reset your password</p> 
        `
        // We will look for the token above in the database to confirm that this link was sent by us.
      })
    })
    .catch(err => {
      const error= new Error(err);
      error.httpStatusCode=500;
      return next(error)
    });
  })
}

exports.getNewPassword = (req,res, next)=>{
  // We also need to verify here that whether we have a user with that token or not
  const token= req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})  //$gt stands for greater than
  .then(user =>{
    let message= req.flash('error');
  if(message.length > 0){
    message=message[0];
  }
  else
  message=null;
  res.render('auth/new-password',{
    path:'/new-password',
    pageTitle: 'New Password',
    errorMessage: message,
    userId: user._id.toString(), // This will be used in the post request where we will update the password.
    passwordToken: token
  })
  })
  .catch(err => {
    const error= new Error(err);
    error.httpStatusCode=500;
    return next(error)
  });
  
}

exports.postNewPassword= (req, res, next)=>{
  const newPassword= req.body.password;
  const userId= req.body.userId;
  const passwordToken= req.body.passwordToken;
  let resetUser;

  User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt : Date.now()}, _id: userId})
  .then(user =>{
    resetUser= user;
    return bcrypt.hash(newPassword,12);
  })
  .then(hashedPassword =>{
    resetUser.password= hashedPassword;
    resetUser.resetToken= undefined;
    resetUser.resetTokenExpiration= undefined;
    return resetUser.save()
  })
  .then(result =>{ 
    res.redirect('/login')
  })
  .catch(err => {
    const error= new Error(err);
    error.httpStatusCode=500;
    return next(error)
  });
}