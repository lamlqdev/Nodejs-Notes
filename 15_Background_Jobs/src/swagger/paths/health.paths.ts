export const healthPaths = {
  '/api/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check with Redis and DB status',
      responses: {
        200: {
          description: 'All services healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      redis: { type: 'string', example: 'ok' },
                      database: { type: 'string', example: 'ok' },
                    },
                  },
                },
              },
            },
          },
        },
        503: { description: 'One or more services unhealthy' },
      },
    },
  },
};
