const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session= require('express-session');

const MONGODB_URI= 'mongodb+srv://password_2001:password_2001@cluster0.b5s3r.mongodb.net/shop'

const MongoDBStore= require('connect-mongodb-session')(session);// Here we pass the session to the function which is yielded by the require statement of the MongoDBStore.

// MongoDBStore is a constructor function to which we pass some options given below.
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();
const store= new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes= require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Below is the initialisation of the session middleware.
app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}))

// secret is used to sign the session cookie, resave is used to forcefully save the session's data, even though nothing is modified so it is set to false
// saveUninitialised is used to prevent the saving of a new session's data without any modifications.

app.use((req, res, next) => {
  User.findById('6731d47a1d1742330c8d3ea5')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    MONGODB_URI
  )
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Max',
          email: 'max@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
