const fs= require('fs')
const path= require('path')

const p = path.join(
    path.dirname(require.main.filename),'data','cart.json');


module.exports = class Cart{
    // constructor(){
    //     this.products = [];
    //     this.totalPrice=0;
    // }

    // The constructor apporach is not suitable as we do not need a new cart for each and every product, instead we want to have a cart which keeps information about all the products for a particular user.

    // so we use the function below
    static addProduct(id, productPrice){
        //This function will perform the following functions
        // Fetch the data of existing cart

        fs.readFile(p, (err, fileContent)=>{
            let cart ={products: [], totalPrice: 0};
            // If we have an error then we need to create the cart otherwise we will deal with the existing cart.
            if(!err){
                cart= JSON.parse(fileContent); // If we have an existing cart, then we will store the existing data by passing the data in the cart.     
            }
            // Cart is created or retrieved successfully till here-----.

            //Analyse the product => if the product is already present in the cart or we have to add a new entry to it.
            const existingProductIndex= cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex]

            let updatedProduct;
             //Add new Product/ Increase quantity of the existing product in the cart
            if(existingProduct){
                updatedProduct = {...existingProduct};
                updatedProduct.qty= updatedProduct.qty + 1;
                cart.products=[...cart.products];
                cart.products[existingProductIndex]= updatedProduct;
            }
            else{
                updatedProduct= {id: id, qty: 1};
                cart.products= [...cart.products, updatedProduct]
            }

            cart.totalPrice= cart.totalPrice + +productPrice
            fs.writeFile(p,JSON.stringify(cart), (err)=>{
                console.log(err);
                
            })

        })


    }
}
