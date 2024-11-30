const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const isAuth= require('../middleware/is-auth');
const { body,check } = require('express-validator/check');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct); // The requests are parsed from left to right, so we have added a middleware after the route.

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',[
    body('title','Title should be atleast 3 characters long').isLength({min: 3}).isString().trim(),
    body('price').isNumeric(),
    body('description').isLength({min: 5, max: 400}).trim()
], isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product',
    [
        body('title','Title should be atleast 3 characters long').isLength({min: 3}).isString().trim(),
        body('price','Please enter a Valid Price').isNumeric(),
        body('description','Please enter a description of minimum 5 characters').isLength({min: 5, max: 400}).trim()
    ], isAuth, adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
