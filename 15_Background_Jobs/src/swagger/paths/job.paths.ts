export const jobPaths = {
  '/api/jobs': {
    get: {
      tags: ['Jobs'],
      summary: 'List all active job postings',
      responses: {
        200: {
          description: 'Active jobs retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  data: { type: 'array', items: { $ref: '#/components/schemas/JobPosting' } },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['Jobs'],
      summary: 'Create a new job posting',
      description:
        'Creates a job posting in the database and enqueues a confirmation email to the recruiter via BullMQ.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateJobRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Job created and email job enqueued',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  data: { $ref: '#/components/schemas/JobPosting' },
                },
              },
            },
          },
        },
        400: { $ref: '#/components/responses/ValidationError' },
      },
    },
  },
  '/api/jobs/{id}/apply': {
    post: {
      tags: ['Jobs'],
      summary: 'Apply to a job posting',
      description:
        'Submits a candidate application. Enqueues an immediate confirmation email and a follow-up reminder email delayed by 3 days.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Job posting ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApplyRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Application submitted and email jobs enqueued',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  data: { $ref: '#/components/schemas/Application' },
                },
              },
            },
          },
        },
        400: { $ref: '#/components/responses/ValidationError' },
        404: { $ref: '#/components/responses/NotFoundError' },
      },
    },
  },
};
