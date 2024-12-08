const postPredictHandler = require('../handlers/recommendationHandler');
 
const routes = [
  {
    path: '/predict',
    method: 'POST',
    handler: postPredictHandler,
    options: {
      payload: {
        /*Mengizinkan data berupa gambar*/
        allow: 'application/json',
        parse: true
      }
    }
  }
]
 
module.exports = routes;