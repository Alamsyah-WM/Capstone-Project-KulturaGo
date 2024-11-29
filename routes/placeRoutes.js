const placeHandler = require('../handlers/placeHandler');

const routes = [
  {
    method: 'GET',
    path: '/api/place',
    handler: placeHandler.getPlace,
  },
];

module.exports = routes;
