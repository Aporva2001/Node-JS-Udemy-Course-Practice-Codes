const express= require('express')
const bodyParser= require('body-parser')

const feedRoutes= require('./routes/feed');

const app= express();

// app.use(bodyParser.urlencoded()) // This is used for url encoded data that is passed through forms.
app.use(bodyParser.json()) // This is used for parsing the json data. It parses the incoming requests and convert it to json

app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin','*') // * is a wildcard, which means that access can be made from any domain.
    // Only allowing origins does not work, we need to specify what operations can be done on the data which is sent to the server.

    res.setHeader('Access-Control-Allow-Methods','OPTIONS, GET, POST, PUT, DELETE, PATCH')
    res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization')
    next();
})
app.use('/feed',feedRoutes)
app.listen(8080);