export const healthPaths = {
  '/api/health': {
    get: {
      tags: ['Health'],
      summary: 'Health check',
      responses: {
        200: {
          description: 'Server is running',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Server is running' },
                },
              },
            },
          },
        },
      },
    },
  },
};
