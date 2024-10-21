const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(products => {
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

  Product.findById(prodId)
  .then((product)=>{  // With sequelize we dont get an array of products but we get a single product.
    // console.log(product);
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
  Product.fetchAll().then(products => {
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
  // console.log(cart);

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
  req.user.getOrders({include: ['products']})
  .then(orders =>{
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders: orders
    });
  })
  .catch(err => console.log(err))
};

exports.postOrder = (req, res, next)=>{
  // First we have to get access to all the cart items.
  let fetchedCart;
  req.user.getCart()
  .then(cart =>{
    fetchedCart=cart;
    return cart.getProducts();
  })
  .then(products =>{
    return req.user.createOrder()
    .then(order =>{
      return order.addProducts(products.map(product =>{
        product.orderItem = {quantity: product.cartItem.quantity} //orderItem has to be same as the table name we passed while defining the order-item model.
        console.log(product);
        return product;
      })) // the products we are passing to the order model needs to have the unique key so that it is identified easily by sequelize.
    })
    
    .catch(err => console.log(err))
  })
  .then(result=>{
    return fetchedCart.setProducts(null); // This is used to cleanup the cart.
  })
  .then(result =>{

    res.redirect('/orders')
  })
  .catch(err => console.log(err))
  // THERE IS A BUG HERE, AS ON DELETING THE PRODUCTS, ORDERS ARE NOT DELETED.
  
}

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