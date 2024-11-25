require('dotenv').config();
const Hapi = require('@hapi/hapi');
const recommendationRoutes = require('./routes/recommendationRoutes');
const mostVisitedRoutes = require('./routes/mostVisitedRoutes');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost',
  });

  // Register routes
  server.route(recommendationRoutes);
  server.route(mostVisitedRoutes);
  
  // Start the server
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
