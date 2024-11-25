require('dotenv').config();
const Hapi = require('@hapi/hapi');
const recommendationRoutes = require('./routes/recommendationRoutes');
const mostVisitedRoutes = require('./routes/mostVisitedRoutes');
const placeRoutes = require('./routes/placeRoutes');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost',
  });

  // Register routes
  server.route(recommendationRoutes);
  server.route(mostVisitedRoutes);
  server.route(placeRoutes);
  
  // Start the server
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
