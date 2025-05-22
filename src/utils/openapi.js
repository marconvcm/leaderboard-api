module.exports = {
   openapi: '3.0.0',
   info: {
      title: 'Leaderboard API',
      version: '1.1.0',
      description: 'API documentation for the Leaderboard microservice with JWT authentication.'
   },
   servers: [
      { url: 'http://localhost:3000', description: 'Local server' }
   ],
   paths: {
      '/auth/challenge': {
         post: {
            summary: 'Request an authentication challenge',
            tags: ['Authentication'],
            requestBody: {
               required: true,
               content: {
                  'application/json': {
                     schema: {
                        type: 'object',
                        properties: {
                           apiKey: { type: 'string', example: 'demo-api-key' }
                        },
                        required: ['apiKey']
                     }
                  }
               }
            },
            responses: {
               200: {
                  description: 'Challenge issued successfully',
                  content: {
                     'application/json': {
                        schema: {
                           type: 'object',
                           properties: {
                              challenge: { type: 'string' },
                              requestId: { type: 'string' }
                           }
                        }
                     }
                  }
               },
               401: { description: 'Invalid API key' },
               500: { description: 'Internal server error' }
            }
         }
      },
      '/auth/verify': {
         post: {
            summary: 'Verify HMAC and get JWT token',
            tags: ['Authentication'],
            requestBody: {
               required: true,
               content: {
                  'application/json': {
                     schema: {
                        type: 'object',
                        properties: {
                           apiKey: { type: 'string', example: 'demo-api-key' },
                           requestId: { type: 'string' },
                           challenge: { type: 'string' },
                           hmac: { type: 'string' }
                        },
                        required: ['apiKey', 'requestId', 'challenge', 'hmac']
                     }
                  }
               }
            },
            responses: {
               200: {
                  description: 'HMAC verified, JWT issued',
                  content: {
                     'application/json': {
                        schema: {
                           type: 'object',
                           properties: {
                              token: { type: 'string' }
                           }
                        }
                     }
                  }
               },
               401: { description: 'Invalid or expired challenge, API key, or HMAC' },
               500: { description: 'Internal server error' }
            }
         }
      },
      '/v1/leaderboard/score': {
         post: {
            summary: 'Add a score for a user (JWT auth)',
            tags: ['Leaderboard - JWT'],
            security: [
               {
                  bearerAuth: []
               }
            ],
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
            responses: {
               201: { description: 'Score added' },
               401: { description: 'Unauthorized - invalid or expired token' },
               500: { description: 'Internal server error' }
            }
         }
      },
      '/v1/leaderboard/': {
         get: {
            summary: 'Get the top N users in the leaderboard (JWT auth)',
            tags: ['Leaderboard - JWT'],
            security: [
               {
                  bearerAuth: []
               }
            ],
            parameters: [
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
               401: { description: 'Unauthorized - invalid or expired token' },
               500: { description: 'Internal server error' }
            }
         }
      },
   },
   components: {
      securitySchemes: {
         apiKey: {
            type: 'apiKey',
            name: 'x-api-key',
            in: 'header'
         },
         bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
         }
      }
   }
};
