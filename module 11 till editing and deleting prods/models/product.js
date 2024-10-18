const Sequelize = require('sequelize');

const sequelize = require('../util/database'); // It is used to manage the database connections. It also offers fully configured sequelize environment.

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