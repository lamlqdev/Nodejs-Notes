export const emailPaths = {
  '/api/emails/send': {
    post: {
      tags: ['Emails'],
      summary: 'Send an email',
      description: 'Send a single email via Resend. Use `delivered@resend.dev` as the `to` address for testing.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SendEmailRequest' },
            examples: {
              basic: {
                summary: 'Basic HTML email',
                value: {
                  to: 'delivered@resend.dev',
                  subject: 'Hello World',
                  html: '<strong>It works!</strong>',
                },
              },
              scheduled: {
                summary: 'Scheduled email',
                value: {
                  to: 'delivered@resend.dev',
                  subject: 'Reminder',
                  html: '<p>This is your reminder.</p>',
                  scheduledAt: '2026-12-25T09:00:00Z',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Email sent successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EmailResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/ValidationError' },
        429: { $ref: '#/components/responses/RateLimitError' },
        500: { $ref: '#/components/responses/InternalError' },
      },
    },
  },
  '/api/emails/batch': {
    post: {
      tags: ['Emails'],
      summary: 'Send a batch of emails',
      description: 'Send up to 100 emails in a single request.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/BatchEmailRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Batch emails sent successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BatchEmailResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/ValidationError' },
        429: { $ref: '#/components/responses/RateLimitError' },
        500: { $ref: '#/components/responses/InternalError' },
      },
    },
  },
  '/api/emails/{id}': {
    get: {
      tags: ['Emails'],
      summary: 'Get email by ID',
      description: 'Retrieve details of a sent email by its Resend ID.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Resend email ID',
          example: '49a3999c-0ce1-4ea6-ab68-550f993de5a5',
        },
      ],
      responses: {
        200: {
          description: 'Email details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EmailDetailsResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/ValidationError' },
        404: { $ref: '#/components/responses/NotFoundError' },
        500: { $ref: '#/components/responses/InternalError' },
      },
    },
  },
  '/api/emails/{id}/cancel': {
    delete: {
      tags: ['Emails'],
      summary: 'Cancel a scheduled email',
      description: 'Cancel a scheduled email that has not been sent yet.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Resend email ID',
        },
      ],
      responses: {
        200: {
          description: 'Scheduled email cancelled',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/EmailResponse' },
            },
          },
        },
        400: { $ref: '#/components/responses/ValidationError' },
        500: { $ref: '#/components/responses/InternalError' },
      },
    },
  },
};
