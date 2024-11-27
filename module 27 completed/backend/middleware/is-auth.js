const jwt= require('jsonwebtoken');

module.exports= (req, res, next)=>{
    const authHeader= req.get('Authorization');
    if(!authHeader){
        const error= new Error('Not Authenticated');
        error.statusCode=401;

        throw error;
    }
    const token= authHeader.split(' ')[1]; // This method is used to get the information about the headers
    let decodedToken;

    try{
        decodedToken= jwt.verify(token,'somesupersecretsecret') // verify() is used to decode as well as verify the token.
    }
    catch(err){
        err.statusCode=500;
        throw err;
    }
    // If the token is not verified, then the following code will execute.
    if(!decodedToken){
        const error= new Error('Not Authenticated');
        error.statusCode=401;
        throw error;
    }
    // Now we want our data to be sent to all the requests.
    req.userId= decodedToken.userId;
    next();
}