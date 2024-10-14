const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(require.main.filename),'data','products.json');
  
const getProductsFromFile= (cb)=>{  // This function is used for path construction and reading a file.
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      return cb([]);
    }
    cb(JSON.parse(fileContent));
  });
}

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl=imageUrl;
    this.description= description;
    this.price= price;
  }

  save() {
    this.id= Math.random().toString();
    getProductsFromFile((products)=>{
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
    })
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products =>{
      
      const product= products.find(p => p.id === id)
      cb(product)
    })
  }
};

