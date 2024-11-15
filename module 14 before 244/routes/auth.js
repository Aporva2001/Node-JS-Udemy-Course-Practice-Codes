const express= require('express');

const authControllers= require('../controllers/auth');
const router= express.Router();

router.get('/login',authControllers.getLogin);
router.post('/login',authControllers.postLogin);

module.exports= router;