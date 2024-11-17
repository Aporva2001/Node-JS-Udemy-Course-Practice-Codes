const bcrypt= require('bcryptjs')
const nodemailer= require('nodemailer')
const sendgridTransport= require('nodemailer-sendgrid-transport')
const User = require('../models/user');

//Here we need to define how our mails will be delivered.
const transporter=nodemailer.createTransport(sendgridTransport({
  auth:{
    api_key: 'api key'
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
    errorMessage: message
    // isAuthenticated: false
  });
};

exports.postSignup = (req, res, next) => {
  const email= req.body.email;
  const password= req.body.password;
  const confirmPassword= req.body.confirmPassword;
  // Now we will look if the user already exists in the database.

  User.findOne({email: email})
  .then((userDoc)=>{
    if(userDoc){ // This will execute if the user already exists.
      req.flash('error','Email already exists')
      return res.redirect('/signup')
    }
    return bcrypt.hash(password,12) // Number 12 defines how many rounds of hashing we want to apply, it is directly proportional to the security.
    .then(hashedPassword =>{
      const user= new User({
        email: email,
        password: hashedPassword,
        cart: {items: []}
      });
      return user.save();
    })
  })
  .then(result =>{
    res.redirect('/login')
    return transporter.sendMail({
      to: email,
      from: 'aporvagoyal065@gmail.com',
      subject: 'Signedup Succeeded For E-Commerce App Node JS',
      html: '<h1>You have successfully signedup!</h1>'
    })

    .catch(err=>{
      console.log(err);
    })
  })
  .catch((err)=>{
    console.log(err);
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
    errorMessage: message
    //  req.flash('error') // This information is removed from the session after being passed to the corressponding view.
    // isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  const email= req.body.email;
  const password= req.body.password;

  User.findOne({email: email})
    .then(user => {

      if(!user){
        req.flash('error','Invalid Email or Password') // this takes a key and value.
        return res.redirect('/login');
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
        req.flash('error','Invalid Email or Password')
        res.redirect('/login');
      })
      .catch(err =>{
        console.log(err);
        res.redirect('/login');
      })
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err)=>{
    console.log(err);
    res.redirect('/');
  });

};
