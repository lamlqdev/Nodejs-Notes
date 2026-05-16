import { emailPaths } from '../swagger/paths/email.paths';
import { healthPaths } from '../swagger/paths/health.paths';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Resend Email API',
    version: '1.0.0',
    description: 'Express API for sending transactional emails via the Resend SDK.',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    schemas: {
      SendEmailRequest: {
        type: 'object',
        required: ['to', 'subject'],
        properties: {
          to: {
            oneOf: [
              { type: 'string', format: 'email' },
              { type: 'array', items: { type: 'string', format: 'email' }, maxItems: 50 },
            ],
            description: 'Recipient email address(es). Max 50.',
            example: 'delivered@resend.dev',
          },
          subject: { type: 'string', description: 'Email subject line.', example: 'Hello World' },
          html: { type: 'string', description: 'HTML email body.', example: '<strong>It works!</strong>' },
          text: { type: 'string', description: 'Plain text email body.' },
          cc: {
            oneOf: [
              { type: 'string', format: 'email' },
              { type: 'array', items: { type: 'string', format: 'email' } },
            ],
          },
          bcc: {
            oneOf: [
              { type: 'string', format: 'email' },
              { type: 'array', items: { type: 'string', format: 'email' } },
            ],
          },
          replyTo: {
            oneOf: [
              { type: 'string', format: 'email' },
              { type: 'array', items: { type: 'string', format: 'email' } },
            ],
          },
          scheduledAt: {
            type: 'string',
            description: 'ISO 8601 date or natural language. Max 30 days ahead.',
            example: '2026-12-25T09:00:00Z',
          },
          tags: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', maxLength: 256 },
                value: { type: 'string', maxLength: 256 },
              },
            },
          },
          idempotencyKey: {
            type: 'string',
            maxLength: 256,
            description: 'Unique key to prevent duplicate sends. Pattern: <event>/<id>.',
            example: 'welcome-user/123456789',
          },
        },
      },
      BatchEmailRequest: {
        type: 'object',
        required: ['emails'],
        properties: {
          emails: {
            type: 'array',
            items: { $ref: '#/components/schemas/SendEmailRequest' },
            minItems: 1,
            maxItems: 100,
          },
        },
      },
      EmailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '49a3999c-0ce1-4ea6-ab68-550f993de5a5' },
            },
          },
        },
      },
      BatchEmailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      EmailDetailsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              object: { type: 'string', example: 'email' },
              to: { type: 'array', items: { type: 'string' } },
              from: { type: 'string' },
              subject: { type: 'string' },
              html: { type: 'string' },
              text: { type: 'string' },
              created_at: { type: 'string', format: 'date-time' },
              last_event: { type: 'string' },
            },
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
        required: ['success', 'message'],
      },
    },
    responses: {
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { success: false, message: 'Validation failed: body.to: Invalid email address' },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { success: false, message: 'Email not found' },
          },
        },
      },
      RateLimitError: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { success: false, message: 'Email rate limit exceeded. Maximum 2 emails per second.' },
          },
        },
      },
      InternalError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { success: false, message: 'Internal Server Error' },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Emails', description: 'Email sending endpoints' },
    { name: 'Health', description: 'Health check' },
  ],
  paths: {
    ...emailPaths,
    ...healthPaths,
  },
};

export const swaggerSpec = swaggerDefinition;
