const expect= require('chai').expect;
const jwt= require('jsonwebtoken');

const authMiddleware= require('../middleware/is-auth');

describe('Auth-Middleware', function(){
    it('should throw an error if the authorization header is not present', function(){
        const req= {            // Here we have defined the request is our own request object.
                                // The request object should call the get function
                                // The get function in reality returns the value of the authorization header
            get: function(headerName){
                return null;    // The get function does not return a value for our authorization call.
            }
        };
        expect(authMiddleware.bind(this, req, {}, ()=>{})).to.throw('Not authenticated.');    // We have passed empty arguments here because we are not concerned with the other two arguments.
        // Here we have executed the function on our own, we want the test code to bind it to the reference
    })
    
    it('it should throw an error if the authorization header is only one string', function(){
        const req= {            
    get: function(headerName){
    return 'xyz';    
    }
        }
        expect(authMiddleware.bind(this, req, {}, ()=>{})).to.throw(); // If we do not want to check for an exact error, we can leave it empty.
    })

    it('should yield a userId after decoding the token', function(){ // test4, if we write it before the last test then the last test will fail because verify() function will be changed globally.
        //so in order to handle that situation of restoring the previous version of methods we use stubs.
        const req= {            
            get: function(headerName){
            return 'Bearer xyz';    
            }
                }
                
                jwt.verify = function(){    // We are overriding the actual verify method of jwt.
                    return {userId: 'abc'}
                }
        authMiddleware(req, {}, ()=>{})
        expect(req).to.have.property('userId')
    })


    it('should throw an error if the token is not verified.', function(){
        const req= {            
            get: function(headerName){
            return 'Bearer xyz';    
            }
                }
        expect(authMiddleware.bind(this, req, {}, ()=>{})).to.throw();
    })
}) // This function is used to group our test cases so that we come to know that error is coming from which middleware.

// We should not test the functions of other dependecies which are not written by us.
// In the fourth test case, we get an error because the expect function is running after running the middleware manually.
// So it is unable to check the verify method, so we need to shutdown the execution of verify method in the last middleware