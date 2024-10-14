const express= require('express');
const path= require('path')
const homepage=require('./routes/homepage')
const users=require('./routes/users')
const app= express();

app.use(express.static(path.join(__dirname,'public')));

app.use(homepage);
app.use(users);
app.use((req,res,next)=>{
    res.status(404).send('<h1>Page Not Found</h1>')
})

app.listen(3000);