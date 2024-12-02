// const express = require('express');
import express from 'express' // ES module syntax
import { resHandler } from './response-handler.js'; // This is used for named exports
// import resHandler from './response-handler.js'; This is used for default exports

// With named exports we have to use the same name in the import and export statement, that is not the case in default exports.

// const resHandler = require('./response-handler');


const app = express();

app.get('/', resHandler);

app.listen(3000);
