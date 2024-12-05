require('dotenv').config();
const Hapi = require('@hapi/hapi');
const loadModel = require('./models/loadModel');
const recommendationRoutes = require('./routes/recommendationRoutes');
const placeRoutes = require('./routes/placeRoutes');
const mostVisitedRoutes = require('./routes/mostVisitedRoutes');
const nearestRoutes = require('./routes/nearestRoutes');
 
(async () => {
    const server = Hapi.server({
        
        port: 3000,
        host: 'localhost',
        routes: {
            cors: {
              origin: ['*'],
            },
        },
    });

    
    const model = await loadModel();
    server.app.model = model;
 
    server.route(placeRoutes);  
    server.route(mostVisitedRoutes);  
    server.route(nearestRoutes);  
    server.route(recommendationRoutes);  
    server.ext('onPreResponse', function (request, h) {
      const response = request.response;
      if (response.isBoom) {  
          const newResponse = h.response({
              status: 'fail',
              message: response.message
          });
          newResponse.code(response.output.statusCode);  
          return newResponse;
      }
      return h.continue;
  });
  
 
    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();