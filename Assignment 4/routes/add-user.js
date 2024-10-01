const express= require('express');
const path= require('path')


const router= express.Router();

const users= [];


router.get('/add-user',(req,res,next)=>{
    res.render('add-user',{pageTitle: 'Add User',path:'/add-user'})
})

router.post('/add-user',(req,res,next)=>{
    // console.log(req.body.userName)    
   users.push({userName: req.body.userName})
   res.redirect('/');
})
exports.users= users;
exports.router= router;