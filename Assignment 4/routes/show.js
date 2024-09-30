const express = require('express');
const path= require('path')
const router= express.Router();
const users= require('./add-user');

router.get('/',(req,res,next)=>{
    res.render('showUsers',{users: users.users, pageTitle: 'Show Users', path: '/'})
})

module.exports= router