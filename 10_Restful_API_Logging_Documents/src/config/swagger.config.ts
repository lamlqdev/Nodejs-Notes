import { productPaths } from '../swagger/paths/products.paths';
import { authPaths } from '../swagger/paths/auth.paths';
import { healthPaths } from '../swagger/paths/health.paths';

const version = '1.0.0';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'RESTful API Documentation',
    version: version,
    description:
      'Comprehensive RESTful API documentation with authentication, authorization, and CRUD operations.',
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
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'JWT token stored in HTTP-only cookie',
      },
    },
    schemas: {
      Product: {
        type: 'object',
        required: [
          'name',
          'price',
          'description',
          'image',
          'category',
          'stock',
        ],
        properties: {
          _id: {
            type: 'string',
            description: 'Product ID',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            description: 'Product name',
            example: 'Laptop',
          },
          price: {
            type: 'number',
            minimum: 0,
            description: 'Product price',
            example: 999.99,
          },
          description: {
            type: 'string',
            maxLength: 1000,
            description: 'Product description',
            example: 'High-performance laptop for developers',
          },
          image: {
            type: 'string',
            description: 'Product image URL',
            example: 'https://example.com/images/laptop.jpg',
          },
          category: {
            type: 'string',
            description: 'Product category',
            example: 'Electronics',
          },
          stock: {
            type: 'integer',
            minimum: 0,
            description: 'Product stock quantity',
            example: 50,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Product creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Product last update date',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
          },
          name: {
            type: 'string',
            description: 'User name',
          },
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'User role',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the request was successful',
            example: false,
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
        },
        required: ['success', 'message'],
      },
      Pagination: {
        type: 'object',
        properties: {
          currentPage: {
            type: 'integer',
            description: 'Current page number',
          },
          totalPages: {
            type: 'integer',
            description: 'Total number of pages',
          },
          totalItems: {
            type: 'integer',
            description: 'Total number of items',
          },
          itemsPerPage: {
            type: 'integer',
            description: 'Number of items per page',
          },
          hasNextPage: {
            type: 'boolean',
            description: 'Whether there is a next page',
          },
          hasPrevPage: {
            type: 'boolean',
            description: 'Whether there is a previous page',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'No token provided',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Access denied. Admin privileges required',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message: 'Product not found',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              message:
                'Validation failed: name: Name must be at least 2 characters',
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Products',
      description: 'Product management endpoints',
    },
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
  paths: {
    ...productPaths,
    ...authPaths,
    ...healthPaths,
  },
};

export const swaggerSpec = swaggerDefinition;
