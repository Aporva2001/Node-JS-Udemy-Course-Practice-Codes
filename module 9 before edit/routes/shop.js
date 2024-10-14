const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/cart', shopController.getCart);

router.post('/cart',shopController.postCart);

router.get('/orders',shopController.getOrders)
router.get('/products', shopController.getProducts);


// router.get('/products/delete') // This route is a specific route so, it should be specified before the dynamic route otherwise the productId's route will get fired


router.get('/products/:productId',shopController.getProduct) // : can be used to handle variable segments in express js routes. Here productId is the variable name

router.get('/checkout',shopController.getCheckout)

module.exports = router;
