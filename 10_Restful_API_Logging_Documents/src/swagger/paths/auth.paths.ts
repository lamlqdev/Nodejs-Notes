export const authPaths = {
  '/api/auth/signup': {
    post: {
      summary: 'Register a new user',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com',
                },
                password: {
                  type: 'string',
                  minLength: 6,
                  example: 'password123',
                },
                name: {
                  type: 'string',
                  example: 'John Doe',
                },
                phone: {
                  type: 'string',
                  example: '0123456789',
                },
                address: {
                  type: 'string',
                  example: '123 Main St',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'User created successfully',
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
                    example: 'User created successfully',
                  },
                  user: {
                    $ref: '#/components/schemas/User',
                  },
                  refreshToken: {
                    type: 'string',
                    description: 'Refresh token for getting new access tokens',
                  },
                },
                required: ['success', 'message'],
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/ValidationError',
        },
        '409': {
          description: 'User already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/auth/signin': {
    post: {
      summary: 'Authenticate user and get tokens',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com',
                },
                password: {
                  type: 'string',
                  example: 'password123',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Sign in successful',
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
                    example: 'Sign in successful',
                  },
                  user: {
                    $ref: '#/components/schemas/User',
                  },
                  refreshToken: {
                    type: 'string',
                  },
                },
                required: ['success', 'message'],
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/ValidationError',
        },
        '401': {
          description: 'Invalid credentials',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  '/api/auth/refresh': {
    post: {
      summary: 'Refresh access token',
      tags: ['Authentication'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['refreshToken'],
              properties: {
                refreshToken: {
                  type: 'string',
                  description: 'Refresh token',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Token refreshed successfully',
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
                    example: 'Token refreshed successfully',
                  },
                },
                required: ['success', 'message'],
              },
            },
          },
        },
        '400': {
          description: 'Refresh token required',
        },
        '401': {
          description: 'Invalid or expired refresh token',
        },
      },
    },
  },
  '/api/auth/logout': {
    post: {
      summary: 'Logout user',
      tags: ['Authentication'],
      responses: {
        '200': {
          description: 'Logged out successfully',
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
                    example: 'Logged out successfully',
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
  '/api/auth/me': {
    get: {
      summary: 'Get current user information',
      tags: ['Authentication'],
      security: [
        {
          bearerAuth: [],
        },
        {
          cookieAuth: [],
        },
      ],
      responses: {
        '200': {
          description: 'User information retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true,
                  },
                  user: {
                    $ref: '#/components/schemas/User',
                  },
                },
                required: ['success'],
              },
            },
          },
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError',
        },
        '404': {
          description: 'User not found',
        },
      },
    },
  },
};
