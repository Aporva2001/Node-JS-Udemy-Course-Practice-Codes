const express= require('express');
const path=require('path')
const adminRoutes= require('./routes/admin')
const shopRoutes= require('./routes/shop')
const bodyParser= require('body-parser');
const errorPageController= require('./controllers/errorpage')

const app= express();

app.set('view engine','ejs') // This 
app.set('views','views')
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname,'public'))) // Used for serving the files in the public folder statically.


app.use('/admin',adminRoutes);
app.use(shopRoutes);


app.use(errorPageController.errorPage)
// we can also write the following line in place of anyother lines.
app.listen(3000);
