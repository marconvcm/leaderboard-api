import swaggerDocs from 'swagger-jsdoc';

var options = {
   definition: {
      openapi: '3.0.0',
      info: {
         title: 'Leaderboard API',
         version: '1.0.0',
         description: 'API documentation for the Leaderboard microservice with JWT authentication.'
      },
      servers: [
         { url: 'http://localhost:3000', description: 'Local server' }
      ]
   },
   apis: ['./src/routes/*.ts']
}

export default swaggerDocs(options);