const Product = require('../model/product')

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render("shop/product-list", { prods: products, pageTitle: 'All Products', path: '/' });

    });
    // const products = adminData.products; // Here we have accesed the data from admindata which is then passed to the view in the next line, the data which we are passing is passed in the form of object, a key value pair, the key of the object will be used to access the products data.
}
// exports.getEditProduct = (req, res, next) =>{
//     res.render('admin/edit-product',{path: '/edit-product', pageTitle: 'Edit Product'})
// }

// exports.getProductsDataAdmin = (req, res, next)=>{
//     res.render('admin/products',{path: 'admin/products', pageTitle: "Products"})
// }

// exports.getCartData =(req, res, next)=>{
//     res.render('shop/cart',{path: 'shop/cart', pageTitle: "Cart"})
// }

// exports.getProductsData = (req, res, next) =>{
//     res.render('shop/product-list', {path : 'shop/products', pageTitle: "Products"})
// }

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render("shop/index", { prods: products, pageTitle: 'Shop', path: '/',

         });

    });
}

exports.getCart = (req, res, next) =>{
    res.render('shop/cart',{
        path: '/cart',
        pageTitle: 'Your Cart'
    })
}

exports.getCheckout = (req, res, next) =>{
    res.render('shop/checkout',{
        path: '/checkout',
        pageTitle: 'Checkout'
    })
}
exports.getOrders =(req, res, next) =>{
    res.render('shop/orders',{
        path: '/orders',
        pageTitle: 'Your Orders'
    })
}
