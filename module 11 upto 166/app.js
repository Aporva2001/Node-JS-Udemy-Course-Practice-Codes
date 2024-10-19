const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database')

const Product= require('./models/product');
const User= require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// db.execute('SELECT * FROM products') // In this we can execute SQL queries by passing them as strings.
// .then((result)=>{
//     console.log(result)
// })
// .catch((err)=> {
//     console.log(err)
// }) 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// We need a middleware so that we can conviniently access the user throughout our app.
app.use((req, res, next)=>{
    User.findByPk(1) // This line will run when we get an incoming request.
    .then((user)=>{
        req.user= user; // This is a sequelize object, not a JS object
        next();
    })
    .catch(err => console.log(err))
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'}); // In options we define how the relationship is being managed.
// cascade means that if user is deleted, then the product related to the user will be deleted automatically.

User.hasMany(Product)

// sync({force: true})
sequelize.sync()
.then(result =>{ // force: true is used to override the existing data (if any) in the database. This is not used during the production but only 
    // during the development phase.
    return User.findByPk(1); // This is used to check if we do have a user. // This code will be running when we start the npm server and not in the case of request.
    // console.log(result);
})
.then(user =>{
    if(!user) {
      return User.create({name: 'Max', email: 'test@test.com'})
    }
    return user; // Here either a promise is returned or an object is returned so we have to be consistent with what we are returning.
})
.then(user =>{
    // console.log(user);
    app.listen(3000)
})
.catch(err =>{
    console.log(err)
})


