module.exports = {
   openapi: '3.0.0',
   info: {
      title: 'Leaderboard API',
      version: '1.0.0',
      description: 'API documentation for the Leaderboard microservice.'
   },
   servers: [
      { url: 'http://localhost:3000/v1/leaderboard', description: 'Local server' }
   ],
   paths: {
      '/score': {
         post: {
            summary: 'Add a score for a user',
            tags: ['Leaderboard'],
            requestBody: {
               required: true,
               content: {
                  'application/json': {
                     schema: {
                        type: 'object',
                        properties: {
                           username: { type: 'string' },
                           score: { type: 'number' }
                        },
                        required: ['username', 'score']
                     }
                  }
               }
            },
            parameters: [
               {
                  name: 'x-api-key',
                  in: 'header',
                  required: true,
                  schema: { type: 'string' }
               }
            ],
            responses: {
               201: { description: 'Score added' },
               400: { description: 'Invalid input or API key' },
               500: { description: 'Internal server error' }
            }
         }
      },
      '/': {
         get: {
            summary: 'Get the top N users in the leaderboard',
            tags: ['Leaderboard'],
            parameters: [
               {
                  name: 'x-api-key',
                  in: 'header',
                  required: true,
                  schema: { type: 'string' }
               },
               {
                  name: 'limit',
                  in: 'query',
                  required: false,
                  schema: { type: 'integer', default: 10 }
               }
            ],
            responses: {
               200: {
                  description: 'Leaderboard',
                  content: {
                     'application/json': {
                        schema: {
                           type: 'array',
                           items: {
                              type: 'object',
                              properties: {
                                 username: { type: 'string' },
                                 score: { type: 'number' }
                              }
                           }
                        }
                     }
                  }
               },
               400: { description: 'Invalid API key' },
               500: { description: 'Internal server error' }
            }
         }
      },
   }
};
