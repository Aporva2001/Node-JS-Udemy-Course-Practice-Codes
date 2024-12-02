const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");
const AuthController = require("../controllers/auth");

describe("Auth-Controller", function () {

    before(function(done){ // This is a hook 
        // before runs once before the execution of the test case and beforeEach runs before the execution of every test case.
        mongoose
      .connect(
        "mongodb+srv://password_2001:password_2001@cluster0.9xfqv.mongodb.net/test-node?retryWrites=true&w=majority&appName=Cluster0"
      )
      .then((result) => {
        const user= new User({
            email: 'test@test.com',
            password: 'tester',
            name: 'test',
            posts: [],
            _id: '5c0f66b979af55031b34728a'
        })
       return user.save();
      })
      .then(()=>{
        done()
      })
    })
  it("should throw an error with code 500 if accessing the database fails", function (done) {
    sinon.stub(User, "findOne");
    User.findOne.throws(); // we are forcing the function to throw an error.

    const req = {
      body: {
        email: "test@test.com",
        password: "tester",
      },
    };
    AuthController.login(req, {}, () => {}).then((result) => {
      // Since the function is async the then block will be executed after the execution of that async funciton. and we also have to write done in function argument so that async behaviour is implemented
      expect(result).to.be.an("error");
      expect(result).to.have.property("statusCode", 500);
      done();
    });

    expect(AuthController.login);
    User.findOne.restore();
  });

  it("should send a response with valid user status for an existing user", function (done) {
    
        const req= {userId: '5c0f66b979af55031b34728a'}
        const res= {
            statusCode:500,
            userStatus: null,
            status: function(code){
                this.statusCode=code;
                return this;
            },
            json: function(data){
                this.userStatus= data.status
            }
        }

        AuthController.getUserStatus(req, res, ()=>{}).then(()=>{
            expect(res.statusCode).to.be.equal(200);
            expect(res.userStatus).to.be.equal('I am new!');
            done(); 
            // the code is unable to exit automatically because we have not disconnected the database
             //It will delete all the objects in the database.
        })
  });

  after(function(done){
    User.deleteMany({}).then(()=>{
        mongoose.disconnect().then(()=>{
            done()
        })
    })
  })
});
