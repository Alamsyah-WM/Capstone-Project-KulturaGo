const placeHandler = require('../handlers/placeHandler');

const routes = [
  {
    method: 'GET',
    path: '/api/place/{id}',
    handler: placeHandler.getPlaceById,
  },
];

module.exports = routes;
