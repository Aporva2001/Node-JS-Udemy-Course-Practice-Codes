const { where } = require('sequelize');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, price, description, imageUrl)
  // Product.create({
    // title: title,
    // price: price,
    // imageUrl: imageUrl,
    // description:description,
    // userId: req.user.id // This is the sequelize object. This is the manual way of doing, instead we can use the method which is automatically
    // provided by sequelize, according to the model we created

  // })
  product.save()
  .then(result =>{
    console.log('Created a Product')
    res.redirect('/admin/products')
    
  }).catch(err => {
    console.log(err)
  })

};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  })
  .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  const product= new Product(updatedTitle, updatedPrice, updatedDesc,updatedImageUrl ,prodId)
  product.save()
  .then(result =>{
    console.log('Updated Product')
    res.redirect('/admin/products'); // This line is kept in the then block so that it does not gets called before the promise is resolved.
  })

  .catch(err => console.log(err))  // This catch block will catch the errors for the promises of save as well as findByPk.

};

exports.getProducts = (req, res, next) => {
  // Product.findAll()
  Product.fetchAll()
  .then((products)=>{
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .then(()=>{
    res.redirect('/cart')
  })
  .catch(err => console.log(err))
};

exports.postDeleteProduct= (req,res,next)=>{
  const prodId= req.body.productId;
  Product.deleteById(prodId)
  .then(()=>{
    console.log('Destroyed Product')
    res.redirect('/admin/products')
  })
  .catch(err =>{
    console.log(err)
  })

};