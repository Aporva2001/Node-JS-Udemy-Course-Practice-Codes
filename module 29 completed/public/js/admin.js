const deleteProduct = (btn)=>{
    const prodId=btn.parentNode.querySelector('[name=productId]').value;
    const csrf=btn.parentNode.querySelector('[name=_csrf]').value;
    
    const productElement =btn.closest('article') // this function points to the closest element which we want to delete.
    fetch('/admin/product/' + prodId,{
        method: 'DELETE', // delete requests do not have a body
        headers: {
            'csrf-token': csrf
        }
    }) // if we do not write http then it will send the request to the current host.
    .then((result)=>{
        return result.json() // This will throw a new promise
    })
    .then(data =>{
        console.log(data)
        productElement.parentNode.removeChild(productElement)
    })
    .catch(err =>{
        console.log(err)
    })
}

// We will use fetch API to send the data
