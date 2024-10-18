const mysql= require('mysql2')

const pool= mysql.createPool({
    host: 'localhost',
    user: 'root', 
    // The above two lines helps us to connect to the database server which has multiple databases
    database: 'node-complete',
    password: 'nodecomplete'

});

module.exports=pool.promise()