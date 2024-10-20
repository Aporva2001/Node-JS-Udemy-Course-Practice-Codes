const mongodb= require('mongodb')

const MongoClient= mongodb.MongoClient;

let _db; // Here _ means that this variable will only be used internally in the file.

const mongoConnect = callback =>{
    MongoClient.connect('mongodb+srv://password_2001:password_2001@cluster0.b5s3r.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0') // This is used to connect to MongoDB. It returns a promise.
    .then((client) =>{
        console.log('Connected')
        _db= client.db() // This is the connection to the database. This needs not to be returned in the callback but we will use another function named getDb()

        callback() // This is the client object which gives us access to the database.
    })
    .catch((err) => {console.log(err)
        throw err;
    })
}

const getDb =()=>{
    if(_db){
        return _db; //access to the database is returned here.
    }
    throw 'No database found'
}

exports.mongoConnect= mongoConnect();
exports.getDb= getDb