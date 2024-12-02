// import fs from 'fs';
import fs from 'fs/promises' // This will be used if we want to use promises with our file systems instead of callbacks.
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename= fileURLToPath(import.meta.url);
const __dirname= dirname(__filename);
// export const resHandler = (req, res, next) => {
//     fs.readFile('my-page.html', 'utf8', (err, data) => {
//       res.send(data);
//     });
// The code below will be used if we are using file system based on promises.

export const resHandler = (req, res, next) => {
    fs.readFile('my-page.html', 'utf8')
    .then(( data) => { // we wont get errors in the then block as for that we have the catch block available.
        res.send(data);
      })
      .catch(err =>{
        console.log(err);
      });
    // res.sendFile(path.join(__dirname,'my-page.html')) //__dirname will not work in this case as there are no globals in this case. We need to import other modules for that 
    // to make work.
  }

//   module.exports= resHandler;
// export default resHandler