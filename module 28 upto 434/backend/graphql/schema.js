const {buildSchema} = require('graphql') // This is the schema which allows us to make a schema

module.exports= buildSchema(`
    type Post{
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
    }

    type User {
    _id: ID!
    name: String!
    email: String!
    password: String
    status: String!
    posts: [Post!]!

    }
    type AuthData {
    token: String!
    userId: String!
    }
    input UserInputData{
    email: String!
    name: String!
    password: String!
    }
    input PostInputData{
    title: String!
    content: String!
    imageUrl: String!
    }
    type RootQuery{
    login(email: String!, password: String!): AuthData!
    }
    type RootMutation{
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
    }
    schema {
        query: RootQuery
        mutation: RootMutation
    }
    `); 
    // It will return the schema object returned by this function.
    // hello is the query name of type string
    // We can make the string required by adding an exclamation mark.
    // `
    // type TestData {
    // text: String!
    // views: Int!
    // }
    // type RootQuery{
    // hello : TestData!
    // }
    // schema {
    // query:  RootQuery
    // }
    // `
    // createUser is the name of the query which will pass userInput to the resolver
    // in order to specify input we use input keyword instead of type which has a number of fields.
    // User data will be returned when we create a user.
    // There is no field for dates in graphql