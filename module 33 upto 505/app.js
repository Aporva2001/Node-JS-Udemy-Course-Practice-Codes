"use strict";
const num1Element = document.getElementById('num1'); // These are the builtin types in typescript.
const num2Element = document.getElementById('num2');
const buttonElement = document.querySelector('button'); // Exclamation mark is to tell the typescript to ignore the null values. 
// const numResults:number[] =[]; // number[] is the way of expressing the types of arrays in typescript.
const numResults = []; // This is the declaration of array using the generic types, the types within the angle bracket defines the type of data to be held 
// by the outer data type which is the array.
const textResults = [];
function add(num1, num2) {
    if (typeof num1 === 'number' && typeof num2 === 'number')
        return num1 + num2; // Here typescript gets confused which that the operation will be followed for which type of data.
    else if (typeof num1 === 'string' && typeof num2 === 'string')
        return num1 + num2;
    return +num1 + +num2;
}
function printResult(resultObj) {
    console.log(resultObj.val);
}
//Explicit any is allowed but not implicit.
// function add(num1, num2: number){ // Not allowed
//     return num1 + num2;
// }
// function add(num1: any, num2: number){ //Allowed
//     return num1 + num2;
// }
buttonElement.addEventListener('click', () => {
    const num1 = num1Element.value;
    const num2 = num2Element.value;
    const result = add(+num1, +num2);
    numResults.push(result);
    const stringResult = add(num1, num2);
    textResults.push(stringResult);
    console.log(result);
    console.log(stringResult);
    printResult({ val: result, timestamp: new Date() });
    console.log(numResults, textResults);
});
console.log(add(1, 6));
// console.log(add('1','6'));
// If we write tsc filename in the terminal then the config file is not taken in account whereas, if we write only tsc
// then the config file is taken into consideration and all the files in that folder are executed.
// Promises in typescript work only with es6 code
// We cannot add angle brackets on any object, we can add only if it is supported.
const myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('It worked!');
    }, 1000);
});
myPromise.then(result => {
    console.log(result.split('w'));
});
