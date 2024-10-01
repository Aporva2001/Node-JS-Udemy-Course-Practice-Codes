const Product = require('../model/product')

exports.getAddProduct=(req,res, next)=>{

    res.render('add-product',{pageTitle: 'Add Product', path: '/admin/add-product', formCSS: true, productCSS: true, activeAddProduct: true});
};

exports.postAddProduct=(req,res, next)=>{

    const product= new Product(req.body.title)
    product.save()
    res.redirect("/");
}

exports.getProducts=(req, res, next) => {
    Product.fetchAll((products)=>{
        res.render("shop", { prods: products , pageTitle: 'Shop', path: '/', hasProducts: products.length > 0,activeShop: true, productCSS: true});

    });
    // const products = adminData.products; // Here we have accesed the data from admindata which is then passed to the view in the next line, the data which we are passing is passed in the form of object, a key value pair, the key of the object will be used to access the products data.
     }


