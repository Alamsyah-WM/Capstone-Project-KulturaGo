const nearestHandler = require('../handlers/nearestHandler');

const routes = [
  {
    method: 'POST',
    path: '/api/nearest',
    handler: nearestHandler.getNearest,
  },
];

module.exports = routes;
