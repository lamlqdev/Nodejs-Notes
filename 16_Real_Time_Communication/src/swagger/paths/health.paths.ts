export const healthPaths = {
  '/api/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check — DB and SSE client count',
      responses: {
        200: {
          description: 'All services healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      database: { type: 'string', example: 'ok' },
                      sseClients: { type: 'integer', example: 3 },
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
