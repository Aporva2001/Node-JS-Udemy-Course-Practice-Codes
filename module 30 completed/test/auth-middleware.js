const expect= require('chai').expect;
const jwt= require('jsonwebtoken');
const sinon= require('sinon');

const authMiddleware= require('../middleware/is-auth');

describe('Auth-Middleware', function(){
    it('should throw an error if the authorization header is not present', function(){
        const req= {            
            get: function(headerName){
                return null;   
            }
        };
        expect(authMiddleware.bind(this, req, {}, ()=>{})).to.throw('Not authenticated.');   
    })
    
    it('it should throw an error if the authorization header is only one string', function(){
        const req= {            
    get: function(headerName){
    return 'xyz';    
    }
        }
        expect(authMiddleware.bind(this, req, {}, ()=>{})).to.throw(); 
        })

    it('should yield a userId after decoding the token', function(){ 
        const req= {            
            get: function(headerName){
            return 'Bearer xyz';    
            }
                }
                sinon.stub(jwt, 'verify') // First argument is the object which has that method and second argument is the name of the method.
                jwt.verify.returns({userId: 'abc'})

                // jwt.verify = function(){    
                //     return {userId: 'abc'}
                // }
        authMiddleware(req, {}, ()=>{})
        expect(req).to.have.property('userId')
        expect(req).to.have.property('userId','abc');
        expect(jwt.verify.called).to.be.true;

        jwt.verify.restore() // This will restore the original verify function.
        //If we want to check if the verify function has been called ever then we will use the code below
    })


    it('should throw an error if the token is not verified.', function(){
        const req= {            
            get: function(headerName){
            return 'Bearer xyz';    
            }
                }
        expect(authMiddleware.bind(this, req, {}, ()=>{})).to.throw();
    })
}) 