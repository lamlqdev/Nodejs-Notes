export const productPaths = {
  '/api/products': {
    get: {
      summary: 'Get list of products',
      tags: ['Products'],
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            default: 1,
          },
          description: 'Page number',
        },
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            default: 10,
            maximum: 100,
          },
          description: 'Number of items per page',
        },
        {
          in: 'query',
          name: 'category',
          schema: {
            type: 'string',
          },
          description: 'Filter by category',
        },
        {
          in: 'query',
          name: 'search',
          schema: {
            type: 'string',
          },
          description: 'Search in name and description',
        },
      ],
      responses: {
        '200': {
          description: 'List of products retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Products retrieved successfully',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      products: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Product',
                        },
                      },
                      pagination: {
                        $ref: '#/components/schemas/Pagination',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/ValidationError',
        },
      },
    },
    post: {
      summary: 'Create a new product',
      tags: ['Products'],
      security: [
        {
          bearerAuth: [],
        },
        {
          cookieAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
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
                name: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 100,
                  example: 'Laptop',
                },
                price: {
                  type: 'number',
                  minimum: 0,
                  example: 999.99,
                },
                description: {
                  type: 'string',
                  maxLength: 1000,
                  example: 'High-performance laptop',
                },
                image: {
                  type: 'string',
                  example: 'https://example.com/images/laptop.jpg',
                },
                category: {
                  type: 'string',
                  example: 'Electronics',
                },
                stock: {
                  type: 'integer',
                  minimum: 0,
                  example: 50,
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Product created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product created successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/Product',
                  },
                },
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/ValidationError',
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError',
        },
        '403': {
          $ref: '#/components/responses/ForbiddenError',
        },
        '409': {
          description: 'Product name already exists',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                message: 'Product with this name already exists',
              },
            },
          },
        },
      },
    },
  },
  '/api/products/{id}': {
    get: {
      summary: 'Get a single product by ID',
      tags: ['Products'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'Product ID',
        },
      ],
      responses: {
        '200': {
          description: 'Product retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product retrieved successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/Product',
                  },
                },
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/ValidationError',
        },
        '404': {
          $ref: '#/components/responses/NotFoundError',
        },
      },
    },
    put: {
      summary: 'Update entire product',
      tags: ['Products'],
      security: [
        {
          bearerAuth: [],
        },
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'Product ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 100,
                },
                price: {
                  type: 'number',
                  minimum: 0,
                },
                description: {
                  type: 'string',
                  maxLength: 1000,
                },
                image: {
                  type: 'string',
                },
                category: {
                  type: 'string',
                },
                stock: {
                  type: 'integer',
                  minimum: 0,
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Product updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product updated successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/Product',
                  },
                },
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/ValidationError',
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError',
        },
        '403': {
          $ref: '#/components/responses/ForbiddenError',
        },
        '404': {
          $ref: '#/components/responses/NotFoundError',
        },
      },
    },
    patch: {
      summary: 'Partially update product',
      tags: ['Products'],
      security: [
        {
          bearerAuth: [],
        },
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'Product ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  minLength: 2,
                  maxLength: 100,
                },
                price: {
                  type: 'number',
                  minimum: 0,
                },
                description: {
                  type: 'string',
                  maxLength: 1000,
                },
                image: {
                  type: 'string',
                },
                category: {
                  type: 'string',
                },
                stock: {
                  type: 'integer',
                  minimum: 0,
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Product updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product updated successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/Product',
                  },
                },
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/ValidationError',
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError',
        },
        '403': {
          $ref: '#/components/responses/ForbiddenError',
        },
        '404': {
          $ref: '#/components/responses/NotFoundError',
        },
      },
    },
    delete: {
      summary: 'Delete a product',
      tags: ['Products'],
      security: [
        {
          bearerAuth: [],
        },
        {
          cookieAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'string',
          },
          description: 'Product ID',
        },
      ],
      responses: {
        '200': {
          description: 'Product deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Product deleted successfully',
                  },
                  data: {
                    $ref: '#/components/schemas/Product',
                  },
                },
              },
            },
          },
        },
        '400': {
          $ref: '#/components/responses/ValidationError',
        },
        '401': {
          $ref: '#/components/responses/UnauthorizedError',
        },
        '403': {
          $ref: '#/components/responses/ForbiddenError',
        },
        '404': {
          $ref: '#/components/responses/NotFoundError',
        },
      },
    },
  },
};
