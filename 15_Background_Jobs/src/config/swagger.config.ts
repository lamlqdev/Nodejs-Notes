import { jobPaths } from '../swagger/paths/job.paths';
import { applicationPaths } from '../swagger/paths/application.paths';
import { healthPaths } from '../swagger/paths/health.paths';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Job Board API — Background Jobs Demo',
    version: '1.0.0',
    description:
      'A Job Board REST API demonstrating BullMQ job queues, node-cron scheduled tasks, and Resend email delivery.',
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
  components: {
    schemas: {
      JobPosting: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clxxxxxx' },
          title: { type: 'string', example: 'Senior TypeScript Engineer' },
          company: { type: 'string', example: 'Acme Corp' },
          description: { type: 'string' },
          expiresAt: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['ACTIVE', 'EXPIRED'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Application: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          jobPostingId: { type: 'string' },
          candidateName: { type: 'string', example: 'Jane Doe' },
          candidateEmail: { type: 'string', example: 'jane@example.com' },
          status: { type: 'string', enum: ['PENDING', 'REVIEWED'] },
          appliedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateJobRequest: {
        type: 'object',
        required: ['title', 'company', 'description', 'expiresAt', 'recruiterEmail', 'recruiterName'],
        properties: {
          title: { type: 'string', example: 'Senior TypeScript Engineer' },
          company: { type: 'string', example: 'Acme Corp' },
          description: { type: 'string', example: 'We are looking for a senior TS engineer...' },
          expiresAt: { type: 'string', format: 'date-time', example: '2026-12-31T23:59:59Z' },
          recruiterEmail: { type: 'string', format: 'email', example: 'recruiter@acme.com' },
          recruiterName: { type: 'string', example: 'Alice Smith' },
        },
      },
      ApplyRequest: {
        type: 'object',
        required: ['candidateName', 'candidateEmail'],
        properties: {
          candidateName: { type: 'string', example: 'Jane Doe' },
          candidateEmail: { type: 'string', format: 'email', example: 'jane@example.com' },
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
            example: { success: false, message: 'Validation failed: body.title: Required' },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { success: false, message: 'Job posting not found' },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Jobs', description: 'Job posting management' },
    { name: 'Applications', description: 'Job applications' },
    { name: 'Health', description: 'Service health check' },
  ],
  paths: { ...jobPaths, ...applicationPaths, ...healthPaths },
};

export const swaggerSpec = swaggerDefinition;
