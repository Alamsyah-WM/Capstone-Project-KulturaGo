const mostVisitedHanlder = require('../handlers/mostVisitedHandler');

const routes = [
  {
    method: 'GET',
    path: '/api/mostVisited',
    handler: mostVisitedHanlder.getMostVisited,
  },
];

module.exports = routes;
