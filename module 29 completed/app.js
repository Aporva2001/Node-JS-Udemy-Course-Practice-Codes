const path = require('path');
const helmet= require('helmet')
const compression= require('compression')
const morgan= require('morgan')
// const https= require('https') // This allows us to start an https server.

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf= require('csurf');
const flash= require('connect-flash');
const multer= require('multer');
const fs= require('fs');

const errorController = require('./controllers/error');
const User = require('./models/user');
require('dotenv').config();

const MONGODB_URI =
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.b5s3r.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority&appName=Cluster0`

  const app = express();
  app.use(helmet())
  app.use(compression())

  const accessLogStream= fs.createWriteStream(path.join(__dirname,'access.log'), {
    flags: 'a' // means appending the data.

  })
  app.use(morgan('combined', {stream: accessLogStream}))

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

const csrfProtection= csrf(); // Here we can pass an object where we can store the secret for signing our tokens, and we can also store the tokens in a cookie or a session, here we are using session to store our token data.

// const privateKey = fs.readFileSync('server.key');
// const certificate= fs.readFileSync('server.cert');
const date= new Date().toDateString() // This line is added additionally as the previous code failed.
const fileStorage= multer.diskStorage({
  destination:(req, file, cb)=>{
    cb(null, 'images')
  },
  filename:(req, file, cb)=>{
    cb(null,date + '-' + file.originalname)
  },
});

const fileFilter= (req, file, cb)=>{
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null, true);
  }
  else
  cb(null, false);
}
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images'))); // These folders are served behind the scenes by express
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(csrfProtection);
app.use(flash()) // Now we can use flash anywhere in the app on the request object. 

app.use((req, res, next)=>{
  res.locals.isAuthenticated= req.session.isLoggedIn; // This allows us to set local variables which are passed in the views. word local is because, they will exist only in the views which are rendered.
  res.locals.csrfToken= req.csrfToken();
  next();
})

app.use((req, res, next)=>{
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      // throw new Error('Dummy error')
      if(!user){
        return next(); // If user does not exists.
      }
      req.user=user;
      next();
    })
    .catch(err => {
      next(new Error(err))
    });
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500',errorController.get500)

app.use(errorController.get404);

app.use((error, req, res, next)=>{
  res.status(500).render('500', {
    pageTitle: 'Internal Server Error',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
})

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    // // console.log(process.env.MONGO_USER)
    // https.createServer({key: privateKey, cert: certificate}, app).listen(process.env.PORT || 3000); // First argument points to the private key and the certificate, and the second argument is 
    // // our request handler which is our app.
    app.listen(process.env.PORT || 3000)
  })
  .catch(err => {
    
    console.log(err);
  });
