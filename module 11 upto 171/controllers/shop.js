const Product = require('../models/product');
const Cart = require('../models/cart');
const { where } = require('sequelize');

exports.getProducts = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  }).catch(err =>{
    console.log(err);
  })
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  // Product.findAll({where: {id: prodId}}).then((products)=>{  // With sequelize we dont get an array of products but we get a single product.
  //   console.log(products);
  //   res.render('shop/product-detail', {
  //     product: products[0],
  //     pageTitle: products[0].title,
  //     path: '/products'
  //   });
  // }).catch(err => console.log(err));  // Unlike findByPk this gives us an array of products


  // Another Apporach in place of using findAll....

  Product.findByPk(prodId)
  .then((product)=>{  // With sequelize we dont get an array of products but we get a single product.
    console.log(product);
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products'
    });
  })
  .catch((err)=>{
    console.log(err)
  });

};

exports.getIndex = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(err =>{
    console.log(err);
  })
  
};

exports.getCart = (req, res, next) => {
  // Cart.getCart(cart =>{
  //   Product.fetchAll(products =>{
  //     const cartProducts=[];
  //     for(product of products){
  //       const cartProductData = cart.products.find(prod => prod.id === product.id)

  //       if(cartProductData){
  //         cartProducts.push({productData: product, qty:cartProductData.qty})
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products:cartProducts
  //     });
  //   })
  // })
// console.log(req.user.cart) // We get undefined because we cannot use cart as a property here but we can use getCart to access the cart
req.user.getCart().then((cart)=>{
  console.log(cart);

  return cart.getProducts() // as the cart is associated with the product through belongs to many
  .then(products =>{
    res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products:products
          });
  })
  .catch(err => console.log(err))
}).catch(err => console.log(err))

};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart; 
  let newQuantity = 1;
  // Product.findByPk(prodId, product => {
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect('/cart');

  req.user.getCart()
  .then(cart =>{
    fetchedCart=cart
    // First we will check if we have that product already in the cart or we want to add a new product.
    return cart.getProducts({where: {id: prodId}})
  })
  //After checking now we will handle the code of what to do with the product
  .then(products =>{
    let product;
    if(products.length > 0)
     product= products[0];

    if(product){
      // If we have an existing product then we will increase its quantity here.

      const oldQuantity= product.cartItem.quantity; // This we can fetch with the help of sequelize
      newQuantity= oldQuantity + 1;
      return product;
    }

    return Product.findByPk(prodId) // we need to find the product because we do have the product in the product database.   
  })
  .then(product =>{
    return fetchedCart.addProduct(product, {through:{quantity: newQuantity}}); // We need to set the in between table data
  })
  
  .then(()=> {
    res.redirect('/cart')
  })
  .catch(err => console.log(err))

};

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders'
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};

exports.postCartDeleteProduct = (req,res, next)=>{
  const prodId= req.body.productId;
  req.user.getCart()
  .then(cart =>{
    return cart.getProducts({where: {id: prodId}})
  })
  .then(products =>{
    const product= products[0];
    // We need to remove the product from the in between table which connects the cart and the products.
    return product.cartItem.destroy()
  })
  .then(result =>{
    res.redirect('/cart');
  })
  .catch(err => console.log(err))
  // Product.findBPk(prodId, product =>{
  //   Cart.deleteProduct(prodId, product.price);
  //   res.redirect('/cart');

  // }) 

}