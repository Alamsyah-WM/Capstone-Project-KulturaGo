const recommendationHandler = require('../handlers/recommendationHandler');

const routes = [
  {
    method: 'POST',
    path: '/preferences/recommendations',
    handler: recommendationHandler.addPreferences,
  },
  {
    method: 'GET',
    path: '/api/recommendations',
    handler: recommendationHandler.getRecommendations,
  },
];

module.exports = routes;
