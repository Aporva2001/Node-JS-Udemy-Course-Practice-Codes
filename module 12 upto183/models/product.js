const getDb= require('../util/database').getDb; // This function can be called now to get access to the database.
class Product{
  constructor(title, price, description, imageUrl){
    this.title= title;
    this.price= price;
    this.description=description;
    this.imageUrl=imageUrl;
  }

  save() // This method is used to connect to mongoDb and save the product.
  {

  }
}
const Product = sequelize.define('product',{
  id:{
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: Sequelize.STRING, // This is used in case we want to set only one type.
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports= Product;