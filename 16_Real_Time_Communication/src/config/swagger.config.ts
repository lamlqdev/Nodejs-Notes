import { roomPaths } from '../swagger/paths/room.paths';
import { healthPaths } from '../swagger/paths/health.paths';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Real-Time Chat API',
    version: '1.0.0',
    description:
      'REST API companion to a Socket.io + SSE real-time chat application. REST handles room management and message history; real-time communication happens over WebSocket (Socket.io) and Server-Sent Events.',
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
  },
  servers: [{ url: 'http://localhost:3000', description: 'Development server' }],
  components: {
    schemas: {
      Room: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clxxxxxx' },
          name: { type: 'string', example: 'general' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          roomId: { type: 'string' },
          username: { type: 'string', example: 'alice' },
          content: { type: 'string', example: 'Hello everyone!' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateRoomRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            example: 'general',
            description: 'Unique room name. Letters, numbers, hyphens, underscores only.',
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
            example: { success: false, message: 'Validation failed: body.name: Required' },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { success: false, message: 'Room not found' },
          },
        },
      },
      ConflictError: {
        description: 'Resource already exists',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: { success: false, message: 'Room "general" already exists' },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Rooms', description: 'Chat room management and message history' },
    { name: 'SSE', description: 'Server-Sent Events for typing indicators and presence' },
    { name: 'Health', description: 'Service health check' },
  ],
  paths: { ...roomPaths, ...healthPaths },
};

export const swaggerSpec = swaggerDefinition;
