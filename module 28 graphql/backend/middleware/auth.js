const jwt= require('jsonwebtoken');

module.exports= (req, res, next)=>{
    const authHeader= req.get('Authorization');
    if(!authHeader){
        req.isAuth=false; // This data will be used in resolvers
        return next();
    }
    const token= authHeader.split(' ')[1]; // This method is used to get the information about the headers
    let decodedToken;

    try{
        decodedToken= jwt.verify(token,'somesupersecretsecret') // verify() is used to decode as well as verify the token.
    }
    catch(err){
        req.isAuth=false;
        return next();
    }
    // If the token is not verified, then the following code will execute.
    if(!decodedToken){
       req.isAuth=false;
       return next();
    }
    // Now we want our data to be sent to all the requests.
    req.userId= decodedToken.userId;
    req.isAuth=true;
    next();
}