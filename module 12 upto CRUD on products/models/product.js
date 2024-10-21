const getDb = require("../util/database").getDb; // This function can be called now to get access to the database.
const mongodb= require('mongodb');
class Product {
  constructor(title, price, description, imageUrl,id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id=  id ? new mongodb.ObjectId(id) : null; // if we will pass it without object creation, then it will be treated as string.
    // This line will always lead to the execution of if block of the save method so we need to add it in a ternary expression.
  }

  save() { // This method is used to connect to mongoDb and save the product.
    const db = getDb();
    let dbOp;
    if(this._id){
      // Update the product
      dbOp= db.collection('products').updateOne({_id: this._id}, {$set : this});
    }
    else{
      // Create a new Product
      dbOp= db.collection("products")
      .insertOne(this) // products is a collection created inside the database.
    }
    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  }

  static fetchAll(){
    const db = getDb();
    return db.collection('products').find() // find() without any arguments is used to retrieve all the data
    // find function does not return a promise but it returns a cursor which helps us to retrieve the objects from the class one by one.
    .toArray() // This is used to convert the function to the javascript array.
    .then(products =>{
      console.log(products);

      return products;
    })
    .catch(err => console.log(err))
  }

  static findById(prodId){
    const db= getDb();
    return db.collection('products').find({_id: new mongodb.ObjectId(prodId)}).next() // The next() function is used to move the cursor ahead while retreiving the data from the database.
    .then(product =>{
      console.log(product)
      return product
    })
    .catch(err => console.log(err))
  }

  static deleteById(prodId){
    const db= getDb()

    return db.collection('products').deleteOne({_id: new mongodb.ObjectId(prodId)})
    .then(result =>{
      console.log('Deleted')
    })
    .catch(err => console.log(err))
  }
}

module.exports = Product;
