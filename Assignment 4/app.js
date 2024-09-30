const express = require('express');
const bodyParser= require('body-parser')
const path= require('path')
const addUser= require('./routes/add-user')
const showUsers= require('./routes/show')

const app = express();

app.set('view engine','ejs')
app.set('views','views');
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname,'public')))

app.use(addUser.router);
app.use(showUsers);

app.use((req,res,next)=>{
    res.render('404',{pageTitle: 'Page Not Found'})
})
app.listen(3000);