export const healthPaths = {
  '/api/health': {
    get: {
      summary: 'Health check endpoint',
      tags: ['Health'],
      responses: {
        '200': {
          description: 'Server is running',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  message: {
                    type: 'string',
                    example: 'Server is running',
                  },
                },
                required: ['success', 'message'],
              },
            },
          },
        },
      },
    },
  },
};
