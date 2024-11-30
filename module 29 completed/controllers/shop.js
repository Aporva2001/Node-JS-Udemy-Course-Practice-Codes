const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");

const ITEMS_PER_PAGE = 2;

// The pdfkit exposes a pdf document constructor
const PDFDocument = require("pdfkit");

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find() // find function returns a cursor
        .skip((page - 1) * ITEMS_PER_PAGE) // this function is used to skip the first x amounts of data
        .limit(ITEMS_PER_PAGE); // This specifies the number of items to be displayed in the page.
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        // isAuthenticated: req.session.isLoggedIn,
        // csrfToken: req.csrfToken() // This is the method provided by the csrf middleware.
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find() // find function returns a cursor
        .skip((page - 1) * ITEMS_PER_PAGE) // this function is used to skip the first x amounts of data
        .limit(ITEMS_PER_PAGE); // This specifies the number of items to be displayed in the page.
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        // isAuthenticated: req.session.isLoggedIn,
        // csrfToken: req.csrfToken() // This is the method provided by the csrf middleware.
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next)=>{
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      let total=0;
      products.forEach(p =>{
        total += p.quantity * p.productId.price;
      })
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}
exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        // isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  // We need to authenticate the users, as not all logged in users should be able to view the orders
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized."));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument(); // This is the readable stream

      res.setHeader("Content-Type", "application/pdf"); // This is to tell the browser about the type of file which will be read.
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      ); // This is used to tell about how the content should be served.

      pdfDoc.pipe(fs.createWriteStream(invoicePath)); // This ensures that the pdf generated here also stores on the server. This is the writing stream to create a file
      pdfDoc.pipe(res); // This ensures that the result is given to the client. This is the writing stream to send a file to the client.

      // pdfDoc.text('Hello world');
      pdfDoc.fontSize(26).text("INVOICE", {
        underline: true,
        align: "center",
      });
      pdfDoc.text("________________________________");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice = totalPrice + prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              "x" +
              " Rs." +
              prod.product.price
          );
      });
      pdfDoc.text("_____________________");
      pdfDoc.fontSize(16).text("Total Price - Rs." + totalPrice);

      pdfDoc.end(); // this is called we are done writing to the pdf stream, both the streams are closed when we call this function.
      // fs.readFile(invoicePath,(err, data)=>{ // This technique is suitable only for reading small files, for large files it may take time so we use read stream of the file.
      //   if(err)
      //     return next(err);

      //   res.setHeader('Content-Type','application/pdf') // This is to tell the browser about the type of file which will be read.
      //   res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"') // This is used to tell about how the content should be served.
      //   res.send(data);
      // })
      //   const file= fs.createReadStream(invoicePath)
      //  file.pipe(res) // The data which is read by the stream is forwarded to the response.

      // Using streams the data is read in the form of streams on the fly, the data is not read at once and is not stored in the memory prior to displaying on the browser.
      // But the data is transmitted in the form of streams and is given to the browser and the browser concatenates the incoming data.
    })
    .catch((err) => next(err));
};
