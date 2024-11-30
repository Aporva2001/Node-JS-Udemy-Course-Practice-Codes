const { validationResult } = require('express-validator/check');
const Product = require('../models/product');
const fileHelper = require('../util/file');
// const mongoose = require('mongoose');



exports.getAddProduct = (req, res, next) => {
  // if(! req.session.isLoggedIn ){
  //   return res.redirect('/login');
  // } // Though it is not a scalable way to protect our routes, we can use it.

  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
    // isAuthenticated: req.session.isLoggedIn
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors= validationResult(req);
  // console.log(imageUrl)

  if(!image){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      validationErrors: [],
      product: {
        title: title,
        price: price,
        description: description
      },
      errorMessage: 'Attached file not of png/jpg type'
      // isAuthenticated: req.session.isLoggedIn
    });
  }
  const imageUrl= image.path;

  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      validationErrors: errors.array(),
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg
      // isAuthenticated: req.session.isLoggedIn
    });
  }
  const product = new Product({
    // _id: new mongoose.Types.ObjectId('673b125c64c00b104818da1d'),
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error= new Error(err);
      error.httpStatusCode=500;
      return next(error)
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const errors= validationResult(req);
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      // throw new Error('Dummy')
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error= new Error(err);
      error.httpStatusCode=500;
      return next(error)
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors= validationResult(req);
  console.log(errors.array())
  if(!errors.isEmpty()){
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      validationErrors: errors.array(),
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg
      // isAuthenticated: req.session.isLoggedIn
    }
  );
  }
  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/')
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(image){
        fileHelper.deleteFile(product.imageUrl)
        product.imageUrl= image.path
        
      }
      return product.save().then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      })
    })
    
    .catch(err => {
      // res.redirect('/500')
      const error= new Error(err);
      error.httpStatusCode=500;
      return next(error)
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})  //
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        // isAuthenticated: req.session.isLoggedIn
      });
    })
        .catch(err => {
      const error= new Error(err);
      error.httpStatusCode=500;
      return next(error)
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product =>{
    if(!product){
      return next(new Error('Product not Found'))
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({_id: prodId, userId: req.user._id}) // Deleteone function should be triggered after we find one product, otherwise it may happen that the product may be deleted before it is find.
  })
  .then(() => {
    console.log('DESTROYED PRODUCT');
    res.status(200).json({message: 'Success'});
  })
      .catch(err => {
        res.status(500).json({message: 'Deleting product failed'})
  });


};
