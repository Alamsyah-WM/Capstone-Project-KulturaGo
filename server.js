require('dotenv').config();
const Hapi = require('@hapi/hapi');
const placeRoutes = require('./routes/placeRoutes');
const mostVisitedRoutes = require('./routes/mostVisitedRoutes');
const nearestRoutes = require('./routes/nearestRoutes');
 
(async () => {
    const server = Hapi.server({
        port: process.env.PORT || 8080,
        host: 'localhost',
        routes: {
          cors: {
            origin: ['*'],
          },
        },
      });

    server.route(placeRoutes);  
    server.route(mostVisitedRoutes);  
    server.route(nearestRoutes);  

    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();