export const roomPaths = {
  '/api/rooms': {
    get: {
      tags: ['Rooms'],
      summary: 'List all chat rooms',
      responses: {
        200: {
          description: 'Rooms retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { type: 'array', items: { $ref: '#/components/schemas/Room' } },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['Rooms'],
      summary: 'Create a new chat room',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateRoomRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Room created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Room' },
                },
              },
            },
          },
        },
        400: { $ref: '#/components/responses/ValidationError' },
        409: { $ref: '#/components/responses/ConflictError' },
      },
    },
  },
  '/api/rooms/{id}/messages': {
    get: {
      tags: ['Rooms'],
      summary: 'Get last 50 messages for a room',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Room ID' },
      ],
      responses: {
        200: {
          description: 'Messages retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { type: 'array', items: { $ref: '#/components/schemas/Message' } },
                },
              },
            },
          },
        },
        404: { $ref: '#/components/responses/NotFoundError' },
      },
    },
  },
  '/api/rooms/{id}/sse': {
    get: {
      tags: ['SSE'],
      summary: 'Open SSE stream for typing indicators and presence',
      description:
        'Establishes a Server-Sent Events connection. Returns a `text/event-stream` response. Events: `typing` and `presence`. Sends a keepalive comment (`: keepalive`) every 30 seconds.',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Room ID' },
      ],
      responses: {
        200: {
          description: 'SSE stream established',
          content: {
            'text/event-stream': {
              schema: { type: 'string', example: 'event: typing\ndata: {"username":"alice","isTyping":true}\n\n' },
            },
          },
        },
        404: { $ref: '#/components/responses/NotFoundError' },
      },
    },
  },
};
