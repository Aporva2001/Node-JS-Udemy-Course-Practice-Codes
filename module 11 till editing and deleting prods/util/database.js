const Sequelize= require('sequelize') // We have used capital letter here because we are importing a class

const sequelize = new Sequelize('node-complete','root','nodecomplete',{dialect: 'mysql',host: 'localhost'}); // dialect is used to tell that we are using the sql database.
// Default value of host is localhost
// It will create a connection pool which we created mannualy in the last module.

module.exports= sequelize;