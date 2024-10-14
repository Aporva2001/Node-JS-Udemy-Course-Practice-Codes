const Product = require('../model/product')
const Cart = require('../model/cart')

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render("shop/product-list", { prods: products, pageTitle: 'All Products', path: '/' });

    });
    // const products = adminData.products; // Here we have accesed the data from admindata which is then passed to the view in the next line, the data which we are passing is passed in the form of object, a key value pair, the key of the object will be used to access the products data.
}

exports.getProduct= (req, res, next)=>{
    const prodId= req.params.productId; // We can use the variable name which we passed in the routes to access the product id data.
    // console.log(prodId);
    Product.findById (prodId, product =>{  // The product is a callback function which will be called after the product has been find out.
        // console.log(product)
        res.render('shop/product-detail',{product: product, pageTitle: product.title, path:'/products'})
    })
    // res.redirect('/');
    
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

exports.postCart =(req, res, next)=>{
    const prodId= req.body.productId;  // we have used body because we are passing the data as a post request which is sent to the request body
    Product.findById(prodId, (product)=>{
        Cart.addProduct(prodId,product.price);  
    })
    res.redirect('/cart')
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
