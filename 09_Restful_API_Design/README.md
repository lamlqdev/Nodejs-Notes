# RESTful API Design

A comprehensive guide to building RESTful APIs with Express, TypeScript, MongoDB, and best practices including layered architecture, schema-based validation, and role-based authorization.

---

## 1. Core Terminology

### What is an API?

An application programming interface (API) defines the rules that you must follow to communicate with other software systems. Developers expose or create APIs so that other applications can communicate with their applications programmatically.

For example, the timesheet application exposes an API that asks for an employee's full name and a range of dates. When it receives this information, it internally processes the employee's timesheet and returns the number of hours worked in that date range.

![API](./public/api.png)

### What is REST?

**Representational State Transfer (REST)** is a software architecture that imposes conditions on how an API should work. REST was initially created as a guideline to manage communication on a complex network like the internet. You can use REST-based architecture to support high-performing and reliable communication at scale. You can easily implement and modify it, bringing visibility and cross-platform portability to any API system.

![RestAPI](./public/rest-api.png)

### What is RESTful API?

API developers can design APIs using several different architectures. APIs that follow the REST architectural style are called REST APIs. Web services that implement REST architecture are called RESTful web services. The term RESTful API generally refers to RESTful web APIs. However, you can use the terms REST API and RESTful API interchangeably.

### RESTful API Principles

![RESTful API Design Principles](./public/rest-principles.png)

### How do RESTful APIs work?

The basic function of a RESTful API is the same as browsing the internet. The client contacts the server by using the API when it requires a resource. API developers explain how the client should use the REST API in the server application [API documentation](../10_Restful_API_Logging_Documents/README.md) (e.g., OpenAPI, Swagger, Postman Collections). These are the general steps for any REST API call:

1. The client sends a request to the server. The client follows the API documentation to format the request in a way that the server understands.
2. The server authenticates the client and confirms that the client has the right to make that request.
3. The server receives the request and processes it internally.
4. The server returns a response to the client. The response contains information that tells the client whether the request was successful. The response also includes any information that the client requested.

The REST API request and response details vary slightly depending on how the API developers design the API.

![Data Formats](./public/data-formats.png)

### Schema-Based Validation

**Schema-based validation** uses predefined schemas to validate incoming request data. Validation rules are defined once and reused across the application instead of being duplicated inside controllers. This approach improves reusability, consistency, type safety, and long-term maintainability. In practice, validation should be applied to **all data coming from the client**, not only the request body.

- **Request Body (req.body)**: Body validation ensures that domain data entering the application is structurally correct and meaningful: required fields and data types, format and constraints (email, length, range, patterns), business rules.

- **Route Parameters (req.params)**: Validating route parameters prevents database casting errors and avoids unnecessary queries with invalid identifiers: resource identifiers (id, slug) and identifier format (ObjectId, UUID).

- **Query Parameters (req.query)**: Query parameters are always strings and must be validated to avoid logic errors and performance issues: pagination values (page, limit), sorting options (sortBy, order), filtering criteria.

### Role-Based Authorization

**Role-Based Access Control (RBAC)** restricts access to resources based on user roles. Different roles have different permissions, allowing fine-grained control over what users can do. **Authorization middleware** checks user roles before allowing access to protected routes. This ensures that only authorized users can perform certain operations.

![Authorization](./public/authentication-authorization.png)

### Passport.js

**Passport.js** is a popular authentication middleware for Node.js applications. It provides a simple, unobtrusive way to handle authentication strategies, making it easy to integrate different authentication methods into Express applications.

**Strategies**: In Passport.js terminology, a **strategy** is a specific authentication mechanism. Strategies are pluggable modules that implement authentication logic for different methods. Common strategies include:

- **JWT Strategy** (`passport-jwt`): Authenticates users using JSON Web Tokens
- **Local Strategy** (`passport-local`): Authenticates with username and password
- **OAuth Strategies**: Authenticate using third-party providers (Google, Facebook, etc.)

Each strategy is configured with specific options (like secret keys, token extraction methods) and a verify callback function that determines how to authenticate the user. Once configured, strategies are registered with Passport using `passport.use()`.

**Role**: Passport.js acts as an authentication framework that handles the authentication flow. When a request comes in, Passport performs the following operations:

- **Extract credentials**: Extracts authentication credentials (tokens, keys, etc.) from the request using configurable extractors (e.g., from Authorization header, cookies, query parameters)
- **Verify credentials**: Verifies the extracted credentials (decodes JWT tokens, validates signatures, checks expiration)
- **Executes the verify callback** where the application decides whether the JWT payload represents a valid user or not
- **Attach user to request**: If authentication succeeds, attaches the authenticated user object to `req.user` for use in subsequent middleware and route handlers
- **Handle authentication errors**: Manages authentication failures, returning appropriate responses or passing errors to error handlers
- **Session management** (optional): Can manage user sessions if session-based authentication is enabled

---

## 2. Implementation Guide

### 2.1. Project Setup & Dependencies

This project builds upon the setup from **[JWT Authentication](../07_JWT_Authentication/README.md)**. Install additional dependencies:

```bash
npm install zod mongoose
```

- **zod**: Schema-based validation library with TypeScript support.
- **mongoose**: MongoDB object modeling library.

### 2.2. Project Structure

Organize your project with a layered architecture. Example project structure:

```plaintext
src/
├── config/          # Configuration files
│   ├── config.ts    # Environment configuration
│   └── database.ts  # Database connection
├── controllers/     # HTTP request handlers
│   ├── auth.controller.ts
│   └── product.controller.ts
├── middlewares/     # Express middleware
│   ├── auth.middleware.ts      # Authentication
│   ├── authorize.middleware.ts # Authorization
│   ├── error.middleware.ts     # Error handling
│   ├── logger.middleware.ts    # Request logging
│   ├── rateLimit.middleware.ts # Rate limiting
│   └── validation.middleware.ts # Input validation
├── models/          # Mongoose models
│   ├── user.model.ts
│   ├── product.model.ts
│   ├── customer.model.ts
│   └── order.model.ts
├── routes/          # Route definitions
│   ├── auth.route.ts
│   └── product.route.ts
├── services/        # Business logic layer
│   ├── user.service.ts
│   └── product.service.ts
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
│   ├── jwt.util.ts
│   └── password.util.ts
├── validations/     # Zod validation schemas
│   ├── user.validation.ts
│   ├── product.validation.ts
│   └── order.validation.ts
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

This structure separates concerns clearly, making the codebase maintainable and scalable.

### 2.3. Schema-Based Validation with Zod

Zod provides a powerful way to define validation schemas with TypeScript support. Create validation schemas in the `validations/` directory.

**Product Validation Schema**: Create `src/validations/product.validation.ts`:

```typescript
import { z } from 'zod';

const productBaseSchema = {
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters'),
  image: z.string().trim().min(1, 'Image URL is required'),
  category: z.string().trim().min(1, 'Category is required'),
  stock: z
    .number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
};

export const createProductSchema = z.object({
  body: z.object(productBaseSchema),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: productBaseSchema.name.optional(),
    price: productBaseSchema.price.optional(),
    description: productBaseSchema.description.optional(),
    image: productBaseSchema.image.optional(),
    category: productBaseSchema.category.optional(),
    stock: productBaseSchema.stock.optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID format'),
  }),
});

export const getProductsQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val: string) => parseInt(val, 10))
      .pipe(z.number().int().min(1, 'Page must be a positive number')),
    limit: z
      .string()
      .optional()
      .default('10')
      .transform((val: string) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int()
          .min(1, 'Limit must be a positive number')
          .max(100, 'Limit cannot exceed 100')
      ),
    category: z.string().trim().optional(),
    search: z.string().trim().optional(),
  }),
});
```

**Generic Validation Middleware**: Create `src/middlewares/validation.middleware.ts`:

```typescript
import type { Request, Response, NextFunction } from 'express';
import { z, type ZodSchema } from 'zod';
import { AppError } from './error.middleware';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err: z.ZodIssue) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        throw new AppError(
          `Validation failed: ${errorMessages.join(', ')}`,
          400
        );
      }
      next(error);
    }
  };
};
```

This generic middleware can validate any Zod schema, making it reusable across all routes. The middleware validates request body, query parameters, and route parameters according to the schema definition.

### 2.4. Service Layer Implementation

Services contain business logic and database operations. They abstract database access from controllers, making controllers simpler and more focused on HTTP handling.

**Product Service**: Create `src/services/product.service.ts`:

```typescript
import { Product } from '../models/product.model';
import type { Types } from 'mongoose';
import { AppError } from '../middlewares/error.middleware';

export async function findProducts(
  filter: ProductFilter,
  options: PaginationOptions
): Promise<PaginatedResult<any>> {
  const { page, limit, sort = { createdAt: -1 } } = options;

  const query: Record<string, any> = {};
  if (filter.category) {
    query.category = filter.category;
  }
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: 'i' } },
      { description: { $regex: filter.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: products,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function findProductById(id: string | Types.ObjectId) {
  const product = await Product.findById(id);
  return product;
}

export async function createProduct(data: CreateProductData) {
  const existingProduct = await Product.findOne({ name: data.name.trim() });
  if (existingProduct) {
    throw new AppError('Product with this name already exists', 409);
  }

  const product = await Product.create({
    name: data.name.trim(),
    price: data.price,
    description: data.description.trim(),
    image: data.image.trim(),
    category: data.category.trim(),
    stock: data.stock,
  });
  return product;
}

export async function updateProduct(
  id: string | Types.ObjectId,
  data: UpdateProductData,
  currentProductName?: string
) {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (data.name && data.name.trim() !== currentProductName) {
    const existingProduct = await Product.findOne({ name: data.name.trim() });
    if (existingProduct) {
      throw new AppError('Product with this name already exists', 409);
    }
  }

  if (data.name !== undefined) product.name = data.name.trim();
  if (data.price !== undefined) product.price = data.price;
  if (data.description !== undefined)
    product.description = data.description.trim();
  if (data.image !== undefined) product.image = data.image.trim();
  if (data.category !== undefined) product.category = data.category.trim();
  if (data.stock !== undefined) product.stock = data.stock;

  await product.save();
  return product;
}

export async function deleteProduct(id: string | Types.ObjectId) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
}
```

Services handle business logic validation, such as checking for duplicate product names, and perform database operations. Controllers call service functions instead of directly accessing models.

### 2.5. Controller Implementation

Controllers are thin layers that handle HTTP requests and responses. They extract data from requests, call service functions, and format responses.

**Product Controller**: Create `src/controllers/product.controller.ts`:

```typescript
import type { Request, Response } from 'express';
import {
  findProducts,
  findProductById,
  createProduct as createProductService,
  updateProduct as updateProductService,
  deleteProduct as deleteProductService,
} from '../services/product.service';

export async function getProductsController(req: Request, res: Response) {
  const { page = '1', limit = '10', category, search } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const filter = {
    ...(category && { category: category as string }),
    ...(search && { search: search as string }),
  };

  const result = await findProducts(filter, {
    page: pageNum,
    limit: limitNum,
  });

  res.json({
    message: 'Products retrieved successfully',
    data: {
      products: result.data,
      pagination: result.pagination,
    },
  });
}

export async function getProductController(req: Request, res: Response) {
  const { id } = req.params;

  const product = await findProductById(id);

  if (!product) {
    return res.status(404).json({
      message: 'Product not found',
    });
  }

  res.json({
    message: 'Product retrieved successfully',
    data: product,
  });
}

export async function createProductController(req: Request, res: Response) {
  const { name, price, description, image, category, stock } = req.body;

  const product = await createProductService({
    name,
    price,
    description,
    image,
    category,
    stock,
  });

  res.status(201).json({
    message: 'Product created successfully',
    data: product,
  });
}

export async function updateProductController(req: Request, res: Response) {
  const { id } = req.params;
  const { name, price, description, image, category, stock } = req.body;

  const currentProduct = await findProductById(id);
  const currentProductName = currentProduct?.name;

  const product = await updateProductService(
    id,
    {
      name,
      price,
      description,
      image,
      category,
      stock,
    },
    currentProductName
  );

  res.json({
    message: 'Product updated successfully',
    data: product,
  });
}

export async function patchProductController(req: Request, res: Response) {
  const { id } = req.params;
  const updates = req.body;

  const currentProduct = await findProductById(id);
  const currentProductName = currentProduct?.name;

  const product = await updateProductService(id, updates, currentProductName);

  res.json({
    message: 'Product updated successfully',
    data: product,
  });
}

export async function deleteProductController(req: Request, res: Response) {
  const { id } = req.params;

  const product = await deleteProductService(id);

  res.json({
    message: 'Product deleted successfully',
    data: product,
  });
}
```

Controllers are simple and focused on HTTP handling. They delegate business logic to services, making the code easier to test and maintain.

### 2.6. Role-Based Authorization

Authorization middleware restricts access based on user roles. This ensures that only authorized users can perform certain operations.

**Authorization Middleware**: Create `src/middlewares/authorize.middleware.ts`:

```typescript
import type { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (req.user.role !== 'admin') {
    throw new AppError('Access denied. Admin privileges required', 403);
  }

  next();
};

export const authorizeRoles = (...roles: Array<'admin' | 'user'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Access denied. Insufficient privileges', 403);
    }

    next();
  };
};
```

The `authorizeAdmin` middleware restricts access to admin users only. The `authorizeRoles` middleware is more flexible and can restrict access to specific roles. Both middlewares must be used after the authentication middleware.

**User Model with Roles**: Update `src/models/user.model.ts`:

```typescript
import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model('User', userSchema);
```

Users have a role field that can be either 'admin' or 'user'. The default role is 'user'. JWT tokens should include the role so that authorization middleware can check it.

### 2.7. Passport.js Implementation

This project uses Passport.js with JWT strategy for authentication. Passport provides a clean, modular approach to handle authentication.

**Install Dependencies**: Install Passport.js and the JWT strategy:

```bash
npm install passport passport-jwt
npm install --save-dev @types/passport-jwt
```

**Extend Express Types**: Create `src/types/express.d.ts` to extend Express Request with the `user` property:

```typescript
declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      role: 'admin' | 'user';
    }
  }
}

export { };
```

This TypeScript declaration extends the Express `Request` interface, allowing `req.user` to be properly typed throughout the application.

**Configure Passport Strategy**: Create `src/config/passport.ts`:

```typescript
import { Strategy as JwtStrategy, ExtractJwt, type StrategyOptions } from 'passport-jwt';
import passport from 'passport';
import type { Request } from 'express';

import config from './config';
import { findUserById } from '../services/user.service';
import type { TokenPayload } from '../utils/jwt.util';

const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    (req: Request) => {
      let token = null;
      if (req && req.cookies) {
        token = req.cookies.accessToken;
      }
      return token;
    },
  ]),
  secretOrKey: config.jwtSecret,
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload: TokenPayload, done) => {
  try {
    const user = await findUserById(payload.userId);
    if (!user) {
      return done(null, false);
    }
    return done(null, {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as 'admin' | 'user',
    });
  } catch (error) {
    return done(error as Error, false);
  }
});

passport.use(jwtStrategy);

export default passport;
```

The JWT strategy is configured to extract tokens from:
- Authorization header as Bearer token
- HTTP-only cookies (for cookie-based authentication)

The verify callback fetches the user from the database and returns user information to be attached to `req.user`.

**Initialize Passport in Express App**: Update `src/app.ts`:

```typescript
import passport from './config/passport';

// ... other middleware

// Passport middleware
app.use(passport.initialize());
```

**Create Authentication Middleware**: Create `src/middlewares/auth.middleware.ts`:

```typescript
import passport from 'passport';

export const authenticate = passport.authenticate('jwt', {
  session: false,
});
```

This middleware uses Passport's JWT strategy to authenticate requests. When authentication succeeds, `req.user` is populated with the user information returned from the strategy's verify callback.

**Use Authentication Middleware in Routes**: Apply the `authenticate` middleware to protected routes:

```typescript
import { authenticate } from '../middlewares/auth.middleware';

router.get('/me', authenticate, getMeController);
```

After authentication, `req.user` is available in controllers and can be used for authorization checks.

### 2.8. Routes with Validation and Authorization

Routes define API endpoints and apply middleware in the correct order. Validation middleware should run before controllers, and authorization middleware should run after authentication.

**Product Routes**: Create `src/routes/product.route.ts`:

```typescript
import { Router } from 'express';
// import controllers, validation middleware, and validation schemas

const router = Router();

router.get('/', validate(getProductsQuerySchema), getProductsController);
router.get('/:id', validate(getProductSchema), getProductController);

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  validate(createProductSchema),
  createProductController
);
router.put(
  '/:id',
  authenticate,
  authorizeAdmin,
  validate(updateProductSchema),
  updateProductController
);
router.patch(
  '/:id',
  authenticate,
  authorizeAdmin,
  validate(patchProductSchema),
  patchProductController
);
router.delete('/:id', authenticate, authorizeAdmin, deleteProductController);

export default router;
```

Public routes (GET) don't require authentication. Protected routes (POST, PUT, PATCH, DELETE) require authentication and admin authorization. Validation middleware runs before controllers to ensure data is valid.

### 2.9. Pagination and Filtering

In most REST APIs, the client sends filtering, sorting, and pagination information through query parameters in the URL. A common request looks like this:

```bash
GET /api/products?page=1&limit=10&category=electronics&search=laptop
```

**Pagination Implementation**: The service layer receives filter, sort, and pagination options from the controller, then builds and executes the database query.

```typescript
export async function findProducts(
  filter: ProductFilter,
  options: PaginationOptions
): Promise<PaginatedResult<any>> {
  const { page, limit, sort = { createdAt: -1 } } = options;

  const query: Record<string, any> = {};
  if (filter.category) {
    query.category = filter.category;
  }
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: 'i' } },
      { description: { $regex: filter.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: products,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
```

#### Filtering

Filtering is implemented using a **plain JavaScript object** that represents query conditions. This object is passed directly to `Model.find(filter)`. Technically, the filter object may contain fields that are not defined in the schema, and the query will still execute without throwing an error. However, this behavior can easily lead to silent logic bugs and potential security issues if client input is trusted blindly.

For this reason, services **should not trust incoming filters**. A common best practice is to define an allowlist of filterable fields and construct the filter object explicitly from that list.

```typescript
export interface ProductFilter {
  category?: string;
  search?: string;
}
```

```typescript
export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: Record<string, 1 | -1>;
}
```

#### Search (Text / Keyword Search)

Search is used for keyword or partial matching, typically for user-facing search boxes. Unlike exact filtering, search allows flexible matching and is usually combined with filter and pagination in the same endpoint. MongoDB provides two common approaches: `$regex` for simple pattern matching and `$text` for full-text search using text indexes. `$regex` is easy to use but does not scale well, while `$text` is more suitable for larger datasets.

Common MongoDB operators used in search:

- `$regex`: matches strings based on a pattern (often combined with `$options: "i"` for case-insensitive search)
- `$text`: performs full-text search on fields with a text index
- `$in`: matches any value in a given array
- `$ne`: excludes a specific value
- `$gt`, `$gte`: greater than / greater than or equal
- `$lt`, `$lte`: less than / less than or equal
- `$and`, `$or`: combine multiple search or filter conditions

#### Sorting

Sorting defines **the order** in which documents are returned before pagination is applied. It is necessary because pagination depends on a stable and predictable order of data. Without sorting, the same record may appear on different pages across requests.

Sorting is usually defined by a field and a direction: **ascending (1)** or **descending (-1)**. For example, sorting by createdAt in descending order ensures that the newest records are returned first. Sorting can also be applied to multiple fields, where the next field is used when values of the previous field are equal.

#### Page-Based Pagination

Page-based pagination is based on the principle that the server should not return all records in a single response. Instead, data is returned in smaller chunks to reduce payload size and improve performance.

In this approach, the client sends a page number and a limit (items per page). The server converts these values into a skip value using the formula `(page - 1) * limit`, then applies skip and limit to the query after sorting.

Along with the paginated data, the server **should return pagination metadata** so the client can correctly render navigation controls. This metadata typically includes the **current page, total pages, total items, items per page,** and **flags** indicating whether next or previous pages are available. This structure allows the client to handle pagination logic without needing to calculate it locally and keeps responsibilities clearly separated between client and server.

```typescript
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

> Note: Search conditions are merged into the same filter object passed to `find()`. Query building is typically done using **chain methods** such as `find()`, `sort()`, `skip()`, and `limit()`, which makes the logic clearer and easier to maintain.


### 2.10. Error Handling

Error handling should be consistent across the application. The service layer throws errors that are caught by the global error handler.

**Service Layer Errors**: Services throw `AppError` instances with appropriate status codes:

```typescript
if (!product) {
  throw new AppError('Product not found', 404);
}

if (existingProduct) {
  throw new AppError('Product with this name already exists', 409);
}
```

**Global Error Handler**: The error handler in `src/middlewares/error.middleware.ts` catches all errors and returns consistent error responses:

```typescript
export const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.status || 500).json({
      message: err.message,
    });
  }

  console.error(err);
  res.status(500).json({
    message: 'Internal Server Error',
  });
};
```

This ensures that all errors are handled consistently and clients receive appropriate error messages with correct status codes.

---

## 3. Best Practices

### 3.1 Validation Strategy

Validation should happen at multiple layers:

- **Middleware Validation**: Validate input format, types, and constraints using Zod schemas. This catches invalid data early before it reaches controllers.

- **Service Validation**: Validate business rules, such as uniqueness constraints and relationships. This requires database access and is handled in the service layer.

- **Model Validation**: Mongoose schemas provide additional validation at the database level. This is the last line of defense.

### 3.2 Error Handling

Use consistent error handling throughout the application:

- Throw `AppError` instances with appropriate status codes in services.

- Let the global error handler catch and format errors consistently.

- Don't expose internal error details to clients in production.

- Use appropriate HTTP status codes: 400 for validation errors, 401 for authentication, 403 for authorization, 404 for not found, 409 for conflicts, 500 for server errors.

---

## 4. Summary of Implementation Steps

1. **[Project Setup & Dependencies](#21-project-setup--dependencies)**: Install `zod` and `mongoose`.
2. **[Project Structure](#22-project-structure)**: Organize the project with a layered architecture (Controllers, Services, Models, Routes).
3. **[Schema-Based Validation with Zod](#23-schema-based-validation-with-zod)**: Define reusable Zod schemas for input validation.
4. **[Service Layer Implementation](#24-service-layer-implementation)**: Implement business logic and database operations, separating them from controllers.
5. **[Controller Implementation](#25-controller-implementation)**: Create thin controllers to handle HTTP requests and delegate to services.
6. **[Role-Based Authorization](#26-role-based-authorization)**: Implement middleware to restrict access based on user roles (RBAC).
7. **[Passport.js Implementation](#27-passportjs-implementation)**: Configure Passport.js with JWT strategy, extend Express types, and create authentication middleware.
8. **[Routes with Validation and Authorization](#28-routes-with-validation-and-authorization)**: Define API endpoints, applying validation and authorization middleware.
9. **[Pagination and Filtering](#29-pagination-and-filtering)**: Implement pagination and filtering logic in services and controllers.
10. **[Error Handling](#210-error-handling)**: Use `AppError` and global error handler for consistent error responses.

## 5. Resources

- [REST API Tutorial](https://restfulapi.net/) - Comprehensive REST API guide
- [Zod Documentation](https://zod.dev/) - Zod validation library documentation
- [Mongoose Documentation](https://mongoosejs.com/docs/) - Mongoose ODM documentation
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html) - Express security and best practices
- [RESTful API Design](https://restfulapi.net/rest-api-design-tutorial-with-example/) - RESTful API design principles
