export const applicationPaths = {
  '/api/applications': {
    get: {
      tags: ['Applications'],
      summary: 'List all applications',
      parameters: [
        {
          name: 'jobId',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'Filter by job posting ID',
        },
      ],
      responses: {
        200: {
          description: 'Applications retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  data: { type: 'array', items: { $ref: '#/components/schemas/Application' } },
                },
              },
            },
          },
        },
      },
    },
  },
};
